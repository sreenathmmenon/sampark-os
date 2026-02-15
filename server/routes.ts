import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { randomBytes } from "crypto";
import { HARBORS, BUYERS, findFishByName } from "../shared/marketData";
import {
  sendWhatsAppMessage,
  sendTelegramMessage,
  broadcastTelegramLiquidation,
  broadcastTelegramChannel,
  sendSMS,
  parseWhatsAppIncoming,
  parseTelegramIncoming,
} from "./omnichannel";
import {
  transcribeVoice,
  synthesizeVoice,
  parseVoiceCommand,
  generateMalayalamResponse,
} from "./voice";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

let currentAuction: any = null;

// Global state for manual approval and human bids
let pendingDeal: {
  buyer_id: string;
  buyer_name: string;
  final_amount: number;
  proposed_at: number;
  timeout_seconds: number;
} | null = null;

let liveAuctionBids: Array<{
  id: string;
  buyer_name: string;
  buyer_id: string;
  bid_amount: number;
  source: "HUMAN";
  channel: "whatsapp" | "telegram" | "ui";
  timestamp: string;
  status: string;
}> = [];

let auctionSSEClients: Array<Response> = [];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/analyze-catch", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const base64Data = image
        .replace(/^data:image\/\w+;base64,/, "")
        .replace(/\s/g, ""); // Remove all whitespace including newlines

      // Detect media type from base64 data (PNG starts with iVBORw0KGgo, JPEG with /9j/)
      let mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1];
      if (!mediaType) {
        mediaType = base64Data.startsWith('iVBOR') ? 'image/png' : 'image/jpeg';
      }

      const message = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType as any,
                  data: base64Data,
                },
              },
              {
                type: "text",
                text: `You are an expert marine biologist and fish market analyst specializing in Indian freshwater and marine species.

Analyze this fish photo and return a JSON object with these fields:
- species: Common English name of the fish species
- species_local: Local Indian name (Malayalam/Hindi/Tamil)
- weight_kg: Estimated weight in kg (number)
- quality_grade: Grade letter (A, B, or C)
- quality_score: Quality score 0-100 (number)
- freshness_hours: Estimated hours since catch (number)

If you cannot identify the fish, provide your best guess based on visual characteristics.
Return ONLY valid JSON, no other text.`,
              },
            ],
          },
        ],
      });

      const content = message.content[0];
      const text = content.type === "text" ? content.text : "";

      let analysis;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
      } catch {
        analysis = {
          species: "Unknown Fish",
          species_local: "Unknown",
          weight_kg: 25,
          quality_grade: "B",
          quality_score: 75,
          freshness_hours: 4,
        };
      }

      analysis.catch_certificate_hash = "0x" + randomBytes(20).toString("hex");

      currentAuction = {
        catch_analysis: analysis,
        state: "analyzed",
      };

      res.json(analysis);
    } catch (error: any) {
      console.error("Analyze catch error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze catch" });
    }
  });

  app.post("/api/start-auction", async (req: Request, res: Response) => {
    try {
      const { catch_analysis } = req.body;
      if (!catch_analysis) {
        return res.status(400).json({ error: "No catch analysis provided" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // Register this client for broadcasting
      auctionSSEClients.push(res);

      // Remove client on disconnect
      req.on("close", () => {
        const index = auctionSSEClients.indexOf(res);
        if (index > -1) {
          auctionSSEClients.splice(index, 1);
        }
        console.log(`[SSE] Client disconnected. Active clients: ${auctionSSEClients.length}`);
      });

      const send = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      console.log(`[SSE] Client connected. Active clients: ${auctionSSEClients.length}`);

      // ✅ SEND ALL EXISTING HUMAN BIDS IMMEDIATELY
      if (liveAuctionBids.length > 0) {
        console.log(`[SSE] Sending ${liveAuctionBids.length} existing human bids to new client`);
        liveAuctionBids.forEach((bid) => {
          send({ type: "bid", bid });
        });
      }

      const species = catch_analysis.species_local || catch_analysis.species;
      const weightKg = catch_analysis.weight_kg || 30;
      const qualityGrade = catch_analysis.quality_grade || "B";
      const qualityScore = catch_analysis.quality_score || 80;

      send({ type: "state", state: "AUCTION_LIVE" });
      send({ type: "threads", count: 5 });
      send({ type: "countdown", seconds: 420 });

      // Set deadline to 3:30 PM IST (Kadamakudy cold storage cutoff)
      const deadline = new Date();
      deadline.setHours(15, 30, 0, 0); // 3:30 PM
      // If it's already past 3:30 PM today, set for tomorrow
      if (deadline.getTime() < Date.now()) {
        deadline.setDate(deadline.getDate() + 1);
      }
      send({ type: "deadline", timestamp: deadline.getTime() });

      // Map HARBORS to SSE format and select recommended (Kochi by default)
      const harbors = HARBORS.map(h => ({
        name: h.name,
        distance_km: h.distanceFromKadamakudy_km,
        fuel_cost: h.fuelCostOneWay,
        eta_minutes: h.transitTime_min,
      }));
      const recommended = harbors[0]; // Kochi Fishing Harbor (very_high buyer density)

      send({ type: "log", agent: "NAVIGATOR", message: `Calculating fuel ROI for ${HARBORS.length} harbors...`, timestamp: getISTTime() });

      await sleep(800);
      send({ type: "harbors", harbors, recommended });
      send({ type: "log", agent: "NAVIGATOR", message: `${recommended.name} optimal: ${recommended.distance_km}km, \u20B9${recommended.fuel_cost} fuel, ${recommended.eta_minutes}min ETA`, timestamp: getISTTime() });

      await sleep(600);
      send({ type: "log", agent: "NEGOTIATOR", message: "Initiating multi-channel auction with premium buyers...", timestamp: getISTTime() });

      // ✅ TELEGRAM AUCTION BROADCAST
      try {
        const auctionBroadcast = `🐟 *NEW AUCTION LIVE on Sampark-OS!*

🎣 Species: ${species}
⚖️ Weight: *${weightKg}kg* | Grade: *${qualityGrade}* (${qualityScore}%)
💰 Market Price: ₹${Math.round((catch_analysis.quality_score || 80) * 4)}/kg
⏰ Deadline: *3:30 PM IST*

📱 Buyers: Reply "BID [amount]" to place your bid
Example: \`BID 450\`

⏱️ Auction closes in 7 minutes

_Powered by Sampark-OS | Matsya Edition_`;

        await broadcastTelegramChannel(auctionBroadcast);
        send({ type: "log", agent: "NEGOTIATOR", message: "📢 Telegram auction broadcast sent to channel", timestamp: getISTTime() });
      } catch (err: any) {
        console.error('[TELEGRAM] Broadcast failed:', err);
        send({ type: "log", agent: "NEGOTIATOR", message: "⚠️ Telegram broadcast failed (auction continues)", timestamp: getISTTime() });
      }

      // Initialize counters and maps
      let bidCounter = 0;
      const bidMap: Record<string, any> = {};

      // ✅ SEND EXISTING HUMAN BIDS (if any were placed before auction started)
      if (liveAuctionBids.length > 0) {
        send({ type: "log", agent: "SYSTEM", message: `📥 Loading ${liveAuctionBids.length} human bid(s) placed earlier`, timestamp: getISTTime() });
        liveAuctionBids.forEach((bid) => {
          send({ type: "bid", bid });
          bidCounter++;
          bidMap[bid.buyer_id] = bid;
        });
      }

      const tools: Anthropic.Tool[] = [
        {
          name: "check_mandi_price",
          description: "Check the current market/mandi price for a fish species in a region",
          input_schema: {
            type: "object" as const,
            properties: {
              species: { type: "string", description: "Fish species name" },
              region: { type: "string", description: "Market region" },
            },
            required: ["species", "region"],
          },
        },
        {
          name: "calculate_fuel_cost",
          description: "Calculate fuel cost to reach a harbor",
          input_schema: {
            type: "object" as const,
            properties: {
              harbor: { type: "string", description: "Harbor name" },
            },
            required: ["harbor"],
          },
        },
        {
          name: "place_bid",
          description: "Record a buyer's bid in the system",
          input_schema: {
            type: "object" as const,
            properties: {
              buyer_id: { type: "string", description: "Buyer identifier" },
              buyer_name: { type: "string", description: "Buyer display name" },
              amount_per_kg: { type: "number", description: "Bid amount per kg in INR" },
              channel: { type: "string", enum: ["whatsapp", "telegram"], description: "Communication channel" },
            },
            required: ["buyer_id", "buyer_name", "amount_per_kg", "channel"],
          },
        },
        {
          name: "reject_and_counter",
          description: "Reject a bid and send a counter-offer",
          input_schema: {
            type: "object" as const,
            properties: {
              buyer_id: { type: "string", description: "Buyer identifier" },
              counter_amount: { type: "number", description: "Counter-offer amount per kg" },
              reason: { type: "string", description: "Reason for rejection" },
            },
            required: ["buyer_id", "counter_amount", "reason"],
          },
        },
        {
          name: "accept_deal",
          description: "Accept a buyer's bid as the final deal",
          input_schema: {
            type: "object" as const,
            properties: {
              buyer_id: { type: "string", description: "Buyer identifier" },
              final_amount: { type: "number", description: "Final agreed amount per kg" },
            },
            required: ["buyer_id", "final_amount"],
          },
        },
        {
          name: "trigger_liquidation",
          description: "Trigger liquidation mode when no acceptable bids received before deadline",
          input_schema: {
            type: "object" as const,
            properties: {
              reason: { type: "string", description: "Reason for liquidation" },
            },
            required: ["reason"],
          },
        },
      ];

      const systemPrompt = `You are the SAMPARK-OS multi-agent negotiation system for Indian fishermen. You manage a swarm of specialized AI agents:
- SCOUT: Identifies and grades catch
- NEGOTIATOR: Handles buyer communications and bidding
- AUDITOR: Enforces fair pricing rules and deadlines
- NAVIGATOR: Calculates logistics and fuel costs

Current catch: ${species}, ${weightKg}kg, Grade ${qualityGrade} (${qualityScore}%)
Harbor: ${recommended.name} (${recommended.distance_km}km, fuel \u20B9${recommended.fuel_cost})

SCENARIO: You have 5+ buyers interested from the Kerala network:
- KFE (Kochi Fresh Exports) - WhatsApp - Gulf export specialist
- MWS (Marina Wholesale Seafood) - WhatsApp - Premium hotel supply
- GGE (Gulf Gate Exports) - WhatsApp - Air-freight Dubai/Saudi
- PKF (Paravur Kadal Foods) - WhatsApp - Fish processing
- HKC (Hotel Kerala Cafe Chain) - Telegram - Restaurant chain
- SCM (Saravana Canteen & Mess) - Telegram - Bulk hostel supply
- VFS (Vypeen Fresh Stall) - Telegram - Local retail

Simulate a realistic auction where:
1. First check the mandi/market price for this species
2. Receive bids from at least 4-5 buyers via WhatsApp and Telegram
3. Reject at least one low bid with a counter-offer
4. Evaluate each bid against the market price, deducting fuel costs
5. Accept the best deal that maximizes net profit for the fisherman

Use the tools provided to execute each step. Think through your reasoning carefully.
Always prioritize the fisherman's net profit after fuel deduction.`;

      await sleep(1000);

      let messages: Anthropic.MessageParam[] = [
        {
          role: "user",
          content: `Start the auction for ${species} (${weightKg}kg, Grade ${qualityGrade}). Check market prices first, then simulate receiving bids from buyers and negotiate the best deal. Use all the tools available to you.`,
        },
      ];

      let auctionComplete = false;

      // Time-based Auditor: Check deadline and auto-trigger liquidation
      const deadlineChecker = setInterval(() => {
        const now = Date.now();
        const timeLeft = deadline.getTime() - now;
        const minutesLeft = Math.floor(timeLeft / 60000);

        // Send urgency warnings
        if (minutesLeft === 30 && !auctionComplete) {
          send({
            type: "log",
            agent: "AUDITOR",
            message: "⚠️ 30 minutes until cold storage deadline. No deal yet - liquidation mode may activate.",
            timestamp: getISTTime(),
          });
        } else if (minutesLeft === 10 && !auctionComplete) {
          send({
            type: "log",
            agent: "AUDITOR",
            message: "🚨 URGENT: 10 minutes until deadline. Risk of ₹500/day cold storage penalty.",
            timestamp: getISTTime(),
          });
        } else if (timeLeft <= 0 && !auctionComplete) {
          // Deadline reached - force liquidation
          send({
            type: "log",
            agent: "AUDITOR",
            message: "❌ DEADLINE REACHED: No acceptable bids secured. Triggering emergency liquidation to prevent cold storage loss.",
            timestamp: getISTTime(),
          });

          send({ type: "state", state: "LIQUIDATION" });

          const liquidationPrice = Math.floor(qualityScore >= 80 ? 350 : 300);
          const flashDeadline = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          });

          broadcastTelegramLiquidation(species, weightKg, liquidationPrice, flashDeadline).catch(console.error);

          send({
            type: "log",
            agent: "NEGOTIATOR",
            message: `Emergency flash sale broadcasted to Telegram: ₹${liquidationPrice}/kg, 30min deadline`,
            timestamp: getISTTime(),
          });

          auctionComplete = true;
          clearInterval(deadlineChecker);
        }
      }, 30000); // Check every 30 seconds

      for (let iteration = 0; iteration < 8 && !auctionComplete; iteration++) {
        try {
          const response = await anthropic.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 8192,
            system: systemPrompt,
            tools,
            messages,
          });

          const assistantContent = response.content;
          messages.push({ role: "assistant", content: assistantContent });

          const toolResults: any[] = [];

          for (const block of assistantContent) {
            if (block.type === "text" && block.text.trim()) {
              const lines = block.text.split("\n").filter((l: string) => l.trim());
              for (const line of lines) {
                const agentMatch = line.match(/\[(SCOUT|NEGOTIATOR|AUDITOR|NAVIGATOR)\]/);
                const agent = agentMatch ? agentMatch[1] as any : "NEGOTIATOR";
                const message = agentMatch ? line.replace(/\[(?:SCOUT|NEGOTIATOR|AUDITOR|NAVIGATOR)\]\s*/, "") : line;
                if (message.trim()) {
                  send({ type: "log", agent, message: message.trim(), timestamp: getISTTime() });
                  await sleep(300);
                }
              }
            }

            if (block.type === "tool_use") {
              const toolName = block.name;
              const toolInput = block.input as any;

              send({
                type: "log",
                agent: "NEGOTIATOR",
                message: `\u2192 Tool Call: ${toolName}(${JSON.stringify(toolInput).slice(0, 80)})`,
                timestamp: getISTTime(),
              });
              await sleep(500);

              let toolResult: any;

              switch (toolName) {
                case "check_mandi_price": {
                  // Use real wholesale prices from market data
                  const fish = findFishByName(toolInput.species || species);
                  const basePrice = fish ? fish.wholesalePrice : (qualityScore >= 90 ? 440 : qualityScore >= 75 ? 400 : 350);
                  const minPrice = fish ? fish.farmgatePrice : basePrice - 40;
                  const maxPrice = fish ? fish.retailPrice : basePrice + 60;

                  toolResult = {
                    species: toolInput.species,
                    region: toolInput.region || "Kerala",
                    average_price_per_kg: basePrice,
                    min_price: minPrice,
                    max_price: maxPrice,
                    last_updated: new Date().toISOString(),
                  };
                  send({
                    type: "log",
                    agent: "AUDITOR",
                    message: `MCP average for ${species}: ₹${basePrice}/kg (range ₹${minPrice}-₹${maxPrice})`,
                    timestamp: getISTTime(),
                  });
                  break;
                }

                case "calculate_fuel_cost": {
                  const harbor = harbors.find((h) => h.name.toLowerCase().includes((toolInput.harbor || "").toLowerCase())) || recommended;
                  toolResult = {
                    harbor: harbor.name,
                    fuel_cost: harbor.fuel_cost,
                    distance_km: harbor.distance_km,
                    eta_minutes: harbor.eta_minutes,
                  };
                  send({
                    type: "log",
                    agent: "NAVIGATOR",
                    message: `Fuel to ${harbor.name}: \u20B9${harbor.fuel_cost} (${harbor.distance_km}km, ${harbor.eta_minutes}min)`,
                    timestamp: getISTTime(),
                  });
                  break;
                }

                case "place_bid": {
                  bidCounter++;
                  const bidId = `bid-${bidCounter}`;
                  const grossValue = toolInput.amount_per_kg * weightKg;
                  const netAfterFuel = grossValue - recommended.fuel_cost;

                  const bid = {
                    id: bidId,
                    buyer_name: toolInput.buyer_name,
                    channel: toolInput.channel || "whatsapp",
                    bid_amount: toolInput.amount_per_kg,
                    gross_value: grossValue,
                    net_after_fuel: netAfterFuel,
                    agent_action: "Evaluating...",
                    status: "ACTIVE" as const,
                    timestamp: getISTTime(),
                  };

                  bidMap[toolInput.buyer_id] = { ...bid, buyer_id: toolInput.buyer_id };
                  send({ type: "bid", bid });

                  // Send acknowledgment via WhatsApp or Telegram
                  const ackMessage = `✅ Bid received: ₹${toolInput.amount_per_kg}/kg for ${weightKg}kg ${species}. Total: ₹${grossValue.toLocaleString("en-IN")}. We're evaluating your offer.`;
                  if (toolInput.channel === "whatsapp") {
                    // In production, this would use real buyer phone numbers
                    console.log(`[WhatsApp] Would send to buyer ${toolInput.buyer_id}: ${ackMessage}`);
                  } else {
                    console.log(`[Telegram] Would send to buyer ${toolInput.buyer_id}: ${ackMessage}`);
                  }

                  toolResult = {
                    bid_id: bidId,
                    buyer_id: toolInput.buyer_id,
                    recorded: true,
                    gross_value: grossValue,
                    net_after_fuel: netAfterFuel,
                  };
                  break;
                }

                case "reject_and_counter": {
                  const buyerData = bidMap[toolInput.buyer_id];
                  if (buyerData) {
                    send({
                      type: "bid_update",
                      bid_id: buyerData.id,
                      updates: { status: "REJECTED", agent_action: `Rejected: ${toolInput.reason}` },
                    });
                    send({
                      type: "log",
                      agent: "AUDITOR",
                      message: `Bid \u20B9${buyerData.bid_amount}/kg rejected. Counter: \u20B9${toolInput.counter_amount}/kg`,
                      timestamp: getISTTime(),
                    });

                    // Send counter-offer via WhatsApp
                    const counterMessage = `❌ Your bid of ₹${buyerData.bid_amount}/kg has been rejected.\n\n📊 Reason: ${toolInput.reason}\n\n💰 Counter-offer: ₹${toolInput.counter_amount}/kg\n\nReply "ACCEPT ${toolInput.counter_amount}" to proceed or "COUNTER [amount]" to negotiate.`;
                    if (buyerData.channel === "whatsapp") {
                      console.log(`[WhatsApp] Would send counter to buyer ${toolInput.buyer_id}: ${counterMessage}`);
                      // await sendWhatsAppMessage(buyerData.phone, counterMessage);
                    }
                  }
                  toolResult = {
                    buyer_id: toolInput.buyer_id,
                    rejected: true,
                    counter_sent: toolInput.counter_amount,
                  };
                  break;
                }

                case "accept_deal": {
                  const acceptedBuyer = bidMap[toolInput.buyer_id];
                  if (acceptedBuyer) {
                    const finalGross = toolInput.final_amount * weightKg;
                    const finalNet = finalGross - recommended.fuel_cost;

                    send({
                      type: "bid_update",
                      bid_id: acceptedBuyer.id,
                      updates: {
                        status: "PROPOSED",
                        bid_amount: toolInput.final_amount,
                        gross_value: finalGross,
                        net_after_fuel: finalNet,
                        agent_action: "PROPOSED - Awaiting approval",
                      },
                    });

                    const riskBuffer = Math.round(finalGross * 0.03);
                    send({
                      type: "economics",
                      data: {
                        gross_bid: finalGross,
                        fuel_cost: recommended.fuel_cost,
                        risk_buffer: riskBuffer,
                        net_profit: finalNet - riskBuffer,
                      },
                    });

                    send({ type: "state", state: "AWAITING_APPROVAL" });
                    send({ type: "countdown", seconds: 120 });
                    send({ type: "threads", count: 0 });

                    // Store pending deal for manual approval
                    pendingDeal = {
                      buyer_id: toolInput.buyer_id,
                      buyer_name: acceptedBuyer.buyer_name,
                      final_amount: toolInput.final_amount,
                      proposed_at: Date.now(),
                      timeout_seconds: 120,
                    };

                    send({
                      type: "log",
                      agent: "AUDITOR",
                      message: `💡 Deal proposed: ${acceptedBuyer.buyer_name} at \u20B9${toolInput.final_amount}/kg. Click APPROVE or wait 2min for auto-approval.`,
                      timestamp: getISTTime(),
                    });

                    console.log(`[APPROVAL] Deal proposed with ${acceptedBuyer.buyer_name} at ₹${toolInput.final_amount}/kg. Awaiting approval (120s timeout)`);
                  }

                  toolResult = {
                    deal_proposed: true,
                    awaiting_approval: true,
                    buyer_id: toolInput.buyer_id,
                    final_amount: toolInput.final_amount,
                  };
                  // DO NOT set auctionComplete - keep loop running for timeout
                  break;
                }

                case "trigger_liquidation": {
                  send({ type: "state", state: "LIQUIDATION" });
                  send({
                    type: "log",
                    agent: "AUDITOR",
                    message: `LIQUIDATION MODE: ${toolInput.reason}`,
                    timestamp: getISTTime(),
                  });

                  // Broadcast liquidation flash sale to Telegram channel
                  const liquidationPrice = Math.floor(qualityScore >= 80 ? 350 : 300);
                  const deadline = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  console.log(`[Telegram] Broadcasting liquidation: ${weightKg}kg ${species} @ ₹${liquidationPrice}/kg`);
                  await broadcastTelegramLiquidation(species, weightKg, liquidationPrice, deadline);

                  send({
                    type: "log",
                    agent: "NEGOTIATOR",
                    message: `Flash sale broadcasted to Telegram: ₹${liquidationPrice}/kg, 30min deadline`,
                    timestamp: getISTTime(),
                  });

                  toolResult = { liquidation_triggered: true };
                  auctionComplete = true;
                  break;
                }

                default:
                  toolResult = { error: "Unknown tool" };
              }

              toolResults.push({
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: JSON.stringify(toolResult),
              });
            }
          }

          if (toolResults.length > 0) {
            messages.push({ role: "user", content: toolResults });
          }

          if (response.stop_reason === "end_turn" && !auctionComplete) {
            send({
              type: "log",
              agent: "AUDITOR",
              message: "Negotiation round ended without a deal. Continuing...",
              timestamp: getISTTime(),
            });
            if (iteration >= 7) {
              auctionComplete = true;
              send({ type: "state", state: "LIQUIDATION" });
              send({
                type: "log",
                agent: "AUDITOR",
                message: "Max negotiation rounds reached. Entering liquidation mode.",
                timestamp: getISTTime(),
              });
            }
          }
        } catch (err: any) {
          console.error("Auction iteration error:", err);
          send({ type: "log", agent: "AUDITOR", message: `System error: ${err.message}`, timestamp: getISTTime() });
          break;
        }

        // Check for pending deal timeout (manual approval timeout)
        if (pendingDeal && !auctionComplete) {
          const elapsedSeconds = (Date.now() - pendingDeal.proposed_at) / 1000;
          const remainingSeconds = Math.max(0, pendingDeal.timeout_seconds - elapsedSeconds);

          // Update countdown every iteration
          send({ type: "countdown", seconds: Math.floor(remainingSeconds) });

          if (elapsedSeconds >= pendingDeal.timeout_seconds) {
            // Timeout expired - auto-approve deal
            send({ type: "log", agent: "SYSTEM", message: `⏰ Approval timeout expired. Auto-approving ${pendingDeal.buyer_name} at ₹${pendingDeal.final_amount}/kg`, timestamp: getISTTime() });

            send({ type: "state", state: "DEAL_SECURED" });
            send({ type: "countdown", seconds: 0 });

            // Telegram notification
            try {
              const dealConfirmation = `✅ *DEAL AUTO-APPROVED — Sampark-OS*

🏆 Winner: *${pendingDeal.buyer_name}*
🐟 Species: ${species}
⚖️ Weight: *${weightKg}kg* | Grade: *${qualityGrade}*
💰 Final Price: *₹${pendingDeal.final_amount}/kg*
📍 Pickup: *${recommended.name}*

⏰ Auto-approved after timeout

_Powered by Sampark-OS_`;

              await broadcastTelegramChannel(dealConfirmation);
              send({ type: "log", agent: "AUDITOR", message: "📢 Deal confirmation sent to Telegram", timestamp: getISTTime() });
            } catch (err: any) {
              console.error('[TELEGRAM] Deal confirmation failed:', err);
            }

            console.log(`[AUTO-APPROVAL] Timeout expired. Deal auto-approved: ${pendingDeal.buyer_name} at ₹${pendingDeal.final_amount}/kg`);

            pendingDeal = null;
            auctionComplete = true;
          }
        }
      }

      clearInterval(deadlineChecker); // Clean up deadline checker
      send({ type: "log", agent: "NAVIGATOR", message: `Route confirmed: ${recommended.name}, ${recommended.distance_km}km, ETA ${recommended.eta_minutes}min`, timestamp: getISTTime() });
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Start auction error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Failed to start auction" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "log", agent: "AUDITOR", message: "System error occurred" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/approve-deal", async (req: Request, res: Response) => {
    try {
      if (!pendingDeal) {
        return res.status(400).json({ error: "No pending deal to approve" });
      }

      const { gross_bid, net_profit, harbor } = req.body;
      const approval = {
        approved: true,
        approved_at: new Date().toISOString(),
        gross_bid,
        net_profit,
        harbor,
        approval_hash: "0x" + randomBytes(16).toString("hex"),
        buyer_id: pendingDeal.buyer_id,
        buyer_name: pendingDeal.buyer_name,
        final_amount: pendingDeal.final_amount,
      };

      if (currentAuction) {
        currentAuction.approval = approval;
      }

      // Broadcast approval to SSE clients
      const approvalMessage = JSON.stringify({
        type: "state",
        state: "DEAL_SECURED",
      }) + "\n\n";

      const logMessage = JSON.stringify({
        type: "log",
        agent: "SYSTEM",
        message: `✅ Deal manually approved by fisherman: ${pendingDeal.buyer_name} at ₹${pendingDeal.final_amount}/kg`,
        timestamp: getISTTime(),
      }) + "\n\n";

      auctionSSEClients.forEach((client) => {
        client.write(`data: ${approvalMessage}`);
        client.write(`data: ${logMessage}`);
      });

      // Send Telegram notification
      try {
        const dealConfirmation = `✅ *DEAL APPROVED — Sampark-OS*

🏆 Winner: *${pendingDeal.buyer_name}*
💰 Final Price: *₹${pendingDeal.final_amount}/kg*
💵 Gross: *₹${gross_bid.toLocaleString("en-IN")}*
💚 Net Profit: *₹${net_profit.toLocaleString("en-IN")}*
📍 Harbor: *${harbor}*

👍 Manually approved by fisherman

_Powered by Sampark-OS_`;

        await broadcastTelegramChannel(dealConfirmation);
        console.log(`[APPROVAL] Telegram notification sent`);
      } catch (err: any) {
        console.error('[TELEGRAM] Approval notification failed:', err);
      }

      console.log(`[APPROVAL] Fisherman approved deal with ${pendingDeal.buyer_name} at ₹${pendingDeal.final_amount}/kg`);

      // Clear pending deal
      pendingDeal = null;

      res.json(approval);
    } catch (error: any) {
      console.error("Approve deal error:", error);
      res.status(500).json({ error: error.message || "Failed to approve deal" });
    }
  });

  // Get current auction state (for buyers in separate browser)
  app.get("/api/current-auction", async (req: Request, res: Response) => {
    try {
      res.json({
        catch_analysis: currentAuction?.catch_analysis || null,
        bids: liveAuctionBids,
        state: currentAuction?.state || "IDLE",
        pending_deal: pendingDeal,
      });
    } catch (error: any) {
      console.error("Get auction error:", error);
      res.status(500).json({ error: error.message || "Failed to get auction" });
    }
  });

  // Get all bids for current auction (AI + human)
  app.get("/api/current-bids", async (req: Request, res: Response) => {
    try {
      // Merge AI bids from current auction with human bids
      const allBids = [...liveAuctionBids];
      res.json({ bids: allBids });
    } catch (error: any) {
      console.error("Get bids error:", error);
      res.status(500).json({ error: error.message || "Failed to get bids" });
    }
  });

  // New endpoint for buyer UI bids
  app.post("/api/place-bid", async (req: Request, res: Response) => {
    try {
      const { buyer_id, buyer_name, bid_amount } = req.body;

      if (!buyer_id || !buyer_name || !bid_amount) {
        return res.status(400).json({ error: "Missing required fields: buyer_id, buyer_name, bid_amount" });
      }

      const amount = parseInt(bid_amount, 10);
      const weight = currentAuction?.catch_analysis?.weight_kg || 30;
      const fuelCost = 795;

      const newBid = {
        id: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        buyer_name,
        buyer_id,
        channel: "whatsapp" as const,
        bid_amount: amount,
        gross_value: amount * weight,
        net_after_fuel: (amount * weight) - fuelCost,
        agent_action: "🙋 HUMAN BID via UI",
        source: "HUMAN" as const,
        timestamp: getISTTime(),
        status: "ACTIVE" as const,
      };

      liveAuctionBids.push(newBid);

      // Broadcast to SSE clients (fisherman dashboard)
      const bidMessage = JSON.stringify({
        type: "bid",
        bid: newBid,
      }) + "\n\n";

      const logMessage = JSON.stringify({
        type: "log",
        agent: "HUMAN_BID",
        message: `💰 ${buyer_name} bid ₹${bid_amount}/kg via buyer UI`,
        timestamp: getISTTime(),
      }) + "\n\n";

      auctionSSEClients.forEach((client) => {
        client.write(`data: ${bidMessage}`);
        client.write(`data: ${logMessage}`);
      });

      console.log(`[BUYER BID] ${buyer_name} (${buyer_id}) placed bid: ₹${bid_amount}/kg via UI`);

      res.json({ success: true, bid: newBid });
    } catch (error: any) {
      console.error("Place bid error:", error);
      res.status(500).json({ error: error.message || "Failed to place bid" });
    }
  });

  // Buyer accepts the deal
  app.post("/api/buyer-accept", async (req: Request, res: Response) => {
    try {
      const { buyer_id, buyer_name } = req.body;
      console.log(`[BUYER ACCEPT] ${buyer_name} (${buyer_id}) accepted the deal`);

      // In a full implementation, this would trigger deal confirmation
      res.json({ success: true, message: "Deal accepted by buyer" });
    } catch (error: any) {
      console.error("Buyer accept error:", error);
      res.status(500).json({ error: error.message || "Failed to accept" });
    }
  });

  // Buyer rejects the deal
  app.post("/api/buyer-reject", async (req: Request, res: Response) => {
    try {
      const { buyer_id, buyer_name } = req.body;
      console.log(`[BUYER REJECT] ${buyer_name} (${buyer_id}) rejected the deal`);

      // In a full implementation, this would continue negotiations
      res.json({ success: true, message: "Deal rejected by buyer" });
    } catch (error: any) {
      console.error("Buyer reject error:", error);
      res.status(500).json({ error: error.message || "Failed to reject" });
    }
  });

  app.get("/api/auction-status", async (_req: Request, res: Response) => {
    res.json({
      state: currentAuction?.state || "IDLE",
      has_catch: !!currentAuction?.catch_analysis,
      approved: !!currentAuction?.approval,
    });
  });

  // WhatsApp Webhook (Twilio)
  app.post("/api/webhooks/whatsapp", async (req: Request, res: Response) => {
    try {
      const incoming = parseWhatsAppIncoming(req.body);
      if (!incoming) {
        return res.status(400).send("Invalid WhatsApp webhook");
      }

      console.log(`[WhatsApp Webhook] From ${incoming.from}: ${incoming.message}`);

      // Parse bid message format: "BID 450" or "COUNTER 475"
      const bidMatch = incoming.message.match(/BID\s+(\d+)/i);
      const counterMatch = incoming.message.match(/COUNTER\s+(\d+)/i);

      if (bidMatch) {
        const amount = parseInt(bidMatch[1], 10);

        const newBid = {
          id: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          buyer_name: incoming.buyerId ? `Buyer ${incoming.buyerId}` : "WhatsApp Buyer",
          buyer_id: incoming.buyerId || incoming.from.slice(-4),
          bid_amount: amount,
          source: "HUMAN" as const,
          channel: "whatsapp" as const,
          timestamp: getISTTime(),
          status: "PENDING",
        };

        liveAuctionBids.push(newBid);

        // Broadcast via SSE
        const bidMessage = JSON.stringify({
          type: "bid",
          bid: newBid,
        }) + "\n\n";

        const logMessage = JSON.stringify({
          type: "log",
          agent: "HUMAN_BID",
          message: `💰 ${newBid.buyer_name} bid ₹${amount}/kg via WhatsApp`,
          timestamp: getISTTime(),
        }) + "\n\n";

        auctionSSEClients.forEach((client) => {
          client.write(`data: ${bidMessage}`);
          client.write(`data: ${logMessage}`);
        });

        console.log(`[WhatsApp] New bid integrated: ₹${amount}/kg from ${incoming.from}`);
      } else if (counterMatch) {
        const amount = parseInt(counterMatch[1], 10);
        console.log(`[WhatsApp] Counter-offer received: ₹${amount}/kg from ${incoming.from}`);
        // TODO: Handle counter-offers
      }

      // Twilio expects empty 200 response
      res.status(200).send("");
    } catch (error: any) {
      console.error("[WhatsApp Webhook] Error:", error);
      res.status(500).send("Internal error");
    }
  });

  // Telegram Webhook
  app.post("/api/webhooks/telegram", async (req: Request, res: Response) => {
    try {
      const incoming = parseTelegramIncoming(req.body);
      if (!incoming) {
        return res.status(200).json({ ok: true });
      }

      console.log(`[Telegram Webhook] From ${incoming.username || incoming.chatId}: ${incoming.message}`);

      // Parse liquidation purchase: "BUY"
      if (incoming.message.toUpperCase() === "BUY") {
        console.log(`[Telegram] Liquidation purchase request from ${incoming.username || incoming.chatId}`);
        await sendTelegramMessage(
          incoming.chatId,
          "✅ Purchase request received! Fisherman will contact you shortly."
        );
        // TODO: Notify fisherman
      }

      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error("[Telegram Webhook] Error:", error);
      res.status(500).json({ ok: false });
    }
  });

  // SMS Webhook (Twilio) for offline sync
  app.post("/api/webhooks/sms", async (req: Request, res: Response) => {
    try {
      const from = req.body.From || "";
      const body = req.body.Body || "";

      console.log(`[SMS Webhook] From ${from}: ${body}`);

      // Parse compressed state format: AUC:KAR:40:GR_A
      const stateMatch = body.match(/AUC:([A-Z]+):(\d+):GR_([A-C])/);
      if (stateMatch) {
        const [_, species, weight, grade] = stateMatch;
        console.log(`[SMS] Auction request: ${species} ${weight}kg Grade ${grade}`);
        // TODO: Trigger auction from SMS
        await sendSMS(from, `Auction starting for ${species} ${weight}kg. Will notify via SMS.`);
      }

      res.status(200).send("");
    } catch (error: any) {
      console.error("[SMS Webhook] Error:", error);
      res.status(500).send("Internal error");
    }
  });

  // Voice Transcription (Sarvam AI)
  app.post("/api/voice/transcribe", async (req: Request, res: Response) => {
    try {
      const { audio, language = "ml-IN" } = req.body;
      if (!audio) {
        return res.status(400).json({ error: "No audio data provided" });
      }

      const result = await transcribeVoice(audio, language as any);
      const command = parseVoiceCommand(result.text);

      res.json({
        text: result.text,
        textEnglish: result.textEnglish,
        language: result.language,
        confidence: result.confidence,
        command,
      });
    } catch (error: any) {
      console.error("[Voice API] Transcription error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe voice" });
    }
  });

  // Voice Synthesis (Sarvam AI)
  app.post("/api/voice/synthesize", async (req: Request, res: Response) => {
    try {
      const { text, language = "ml-IN", voice = "male" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      const audioBase64 = await synthesizeVoice(text, language as any, voice as any);

      res.json({
        audio: audioBase64,
        language,
      });
    } catch (error: any) {
      console.error("[Voice API] Synthesis error:", error);
      res.status(500).json({ error: error.message || "Failed to synthesize voice" });
    }
  });

  // Voice Deal Confirmation (shortcut for common response)
  app.post("/api/voice/deal-confirmation", async (req: Request, res: Response) => {
    try {
      const { net_profit, buyer_name, language = "ml-IN" } = req.body;

      const malayalamText = generateMalayalamResponse(net_profit, buyer_name);
      const audioBase64 = await synthesizeVoice(malayalamText, language as any);

      res.json({
        text: malayalamText,
        audio: audioBase64,
        language,
      });
    } catch (error: any) {
      console.error("[Voice API] Deal confirmation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate confirmation" });
    }
  });

  return httpServer;
}

function getISTTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
