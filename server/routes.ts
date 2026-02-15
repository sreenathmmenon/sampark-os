import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { randomBytes } from "crypto";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

let currentAuction: any = null;

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

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250514",
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

      const send = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      const species = catch_analysis.species_local || catch_analysis.species;
      const weightKg = catch_analysis.weight_kg || 30;
      const qualityGrade = catch_analysis.quality_grade || "B";
      const qualityScore = catch_analysis.quality_score || 80;

      send({ type: "state", state: "AUCTION_LIVE" });
      send({ type: "threads", count: 5 });
      send({ type: "countdown", seconds: 420 });

      const harbors = [
        { name: "Kochi Harbor", distance_km: 12, fuel_cost: 2100, eta_minutes: 45 },
        { name: "Alappuzha Port", distance_km: 28, fuel_cost: 4800, eta_minutes: 90 },
        { name: "Munambam Dock", distance_km: 18, fuel_cost: 3200, eta_minutes: 60 },
      ];
      const recommended = harbors[0];

      send({ type: "log", agent: "NAVIGATOR", message: "Calculating fuel ROI for 3 harbors...", timestamp: getISTTime() });

      await sleep(800);
      send({ type: "harbors", harbors, recommended });
      send({ type: "log", agent: "NAVIGATOR", message: `${recommended.name} optimal: ${recommended.distance_km}km, \u20B9${recommended.fuel_cost} fuel, ${recommended.eta_minutes}min ETA`, timestamp: getISTTime() });

      await sleep(600);
      send({ type: "log", agent: "NEGOTIATOR", message: "Initiating multi-channel auction with premium buyers...", timestamp: getISTTime() });

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

SCENARIO: You have 5 buyers interested. Simulate a realistic auction where:
1. First check the mandi/market price for this species
2. Receive bids from at least 4 buyers via WhatsApp and Telegram
3. Reject at least one low bid with a counter-offer
4. Evaluate each bid against the market price, deducting fuel costs
5. Accept the best deal that maximizes net profit for the fisherman

Use the tools provided to execute each step. Think through your reasoning carefully.
Price range should be realistic for Indian fish markets (roughly \u20B9350-500/kg for premium species).
Always prioritize the fisherman's net profit after fuel deduction.`;

      await sleep(1000);

      let messages: Anthropic.MessageParam[] = [
        {
          role: "user",
          content: `Start the auction for ${species} (${weightKg}kg, Grade ${qualityGrade}). Check market prices first, then simulate receiving bids from buyers and negotiate the best deal. Use all the tools available to you.`,
        },
      ];

      let bidCounter = 0;
      const bidMap: Record<string, any> = {};
      let auctionComplete = false;

      for (let iteration = 0; iteration < 8 && !auctionComplete; iteration++) {
        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250514",
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
                  const basePrice = qualityScore >= 90 ? 440 : qualityScore >= 75 ? 400 : 350;
                  toolResult = {
                    species: toolInput.species,
                    region: toolInput.region || "Kerala",
                    average_price_per_kg: basePrice,
                    min_price: basePrice - 40,
                    max_price: basePrice + 60,
                    last_updated: new Date().toISOString(),
                  };
                  send({
                    type: "log",
                    agent: "AUDITOR",
                    message: `MCP average for ${species}: \u20B9${basePrice}/kg (range \u20B9${basePrice - 40}-\u20B9${basePrice + 60})`,
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
                        status: "ACCEPTED",
                        bid_amount: toolInput.final_amount,
                        gross_value: finalGross,
                        net_after_fuel: finalNet,
                        agent_action: "ACCEPTED - Best net margin",
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

                    send({ type: "state", state: "DEAL_SECURED" });
                    send({ type: "countdown", seconds: 0 });
                    send({ type: "threads", count: 0 });

                    send({
                      type: "log",
                      agent: "AUDITOR",
                      message: `Deal locked with ${acceptedBuyer.buyer_name} at \u20B9${toolInput.final_amount}/kg. Awaiting human confirmation.`,
                      timestamp: getISTTime(),
                    });
                  }

                  toolResult = {
                    deal_accepted: true,
                    buyer_id: toolInput.buyer_id,
                    final_amount: toolInput.final_amount,
                  };
                  auctionComplete = true;
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
      }

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
      const { gross_bid, net_profit, harbor } = req.body;
      const approval = {
        approved: true,
        approved_at: new Date().toISOString(),
        gross_bid,
        net_profit,
        harbor,
        approval_hash: "0x" + randomBytes(16).toString("hex"),
      };

      if (currentAuction) {
        currentAuction.approval = approval;
      }

      res.json(approval);
    } catch (error: any) {
      console.error("Approve deal error:", error);
      res.status(500).json({ error: error.message || "Failed to approve deal" });
    }
  });

  app.get("/api/auction-status", async (_req: Request, res: Response) => {
    res.json({
      state: currentAuction?.state || "IDLE",
      has_catch: !!currentAuction?.catch_analysis,
      approved: !!currentAuction?.approval,
    });
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
