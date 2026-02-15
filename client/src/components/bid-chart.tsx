import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

interface Bid {
  id: string;
  buyer_name: string;
  bid_amount: number;
  timestamp: string;
  source?: "AI" | "HUMAN";
}

interface BidChartProps {
  bids: Bid[];
}

export function BidChart({ bids }: BidChartProps) {
  const chartData = useMemo(() => {
    if (!bids || bids.length === 0) return [];

    return bids.map((bid, index) => ({
      index: index + 1,
      time: bid.timestamp,
      amount: bid.bid_amount,
      buyer: bid.buyer_name,
      source: bid.source || "AI",
      label: `${bid.buyer_name}: ₹${bid.bid_amount}`,
    }));
  }, [bids]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-700">
        <p className="text-gray-500">No bids yet. Chart will appear when bidding starts.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-56 bg-gray-900 rounded-lg border border-gray-700 p-3">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        📊 Real-Time Bid Prices
        <span className="text-xs text-gray-400">({chartData.length} bids)</span>
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="index"
            label={{ value: "Bid #", position: "insideBottom", offset: 0, fill: "#9CA3AF" }}
            stroke="#9CA3AF"
            height={60}
          />
          <YAxis
            label={{ value: "₹ per kg", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
            stroke="#9CA3AF"
            domain={['dataMin - 20', 'dataMax + 20']}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "8px" }}
            labelStyle={{ color: "#F3F4F6" }}
            itemStyle={{ color: "#10B981" }}
            formatter={(value: any, name: any, props: any) => {
              const buyer = props.payload.buyer;
              const source = props.payload.source;
              return [`₹${value}/kg`, `${buyer} ${source === "HUMAN" ? "🙋" : "🤖"}`];
            }}
            labelFormatter={(label) => `Bid #${label}`}
          />
          <Legend
            wrapperStyle={{ color: "#9CA3AF" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#10B981"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              const isHuman = payload.source === "HUMAN";
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHuman ? 6 : 4}
                  fill={isHuman ? "#F59E0B" : "#10B981"}
                  stroke={isHuman ? "#FBBF24" : "#34D399"}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 8, fill: "#34D399" }}
            name="Bid Amount (₹/kg)"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>AI Bids</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Human Bids 🙋</span>
        </div>
      </div>
    </div>
  );
}
