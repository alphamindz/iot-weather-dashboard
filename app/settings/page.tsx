"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

import Link from "next/link";

export default function SettingsPage() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [interval, setIntervalVal] = useState(5);
  const [offset, setOffset] = useState(0.0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Supabase se current config load karna
  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from("device_config")
          .select("*")
          .eq("id", 1)
          .single();

        if (error) throw error;
        if (data) {
          setSsid(data.wifi_ssid || "");
          setPassword(data.wifi_password || "");
          setIntervalVal(data.push_interval_sec || 5);
          setOffset(data.sensor_calibration_offset || 0.0);
        }
      } catch (err: any) {
        setMessage("Load failed: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  // Form submit: naye values Supabase me sync karna
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("device_config")
      .upsert({
        id: 1,
        wifi_ssid: ssid,
        wifi_password: password,
        push_interval_sec: Number(interval),
        sensor_calibration_offset: Number(offset),
        updated_at: new Date().toISOString(),
      });

    setSaving(false);
    if (!error) {
      setMessage("Config synced to cloud! ESP32 will adopt these parameters.");
    } else {
      setMessage("Error saving config: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading device parameters...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-[#111827] border border-cyan-500/20 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h1 className="text-lg font-bold text-cyan-400">ESP32 Provisioning & Config</h1>
          <Link href="/" className="text-xs text-gray-400 hover:text-white underline">
            ← Dashboard
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Target Wi-Fi SSID</label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="e.g. Host_WiFi"
              required
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Wi-Fi Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank if open"
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Push Interval (Sec)</label>
              <input
                type="number"
                min="2"
                max="60"
                value={interval}
                onChange={(e) => setIntervalVal(Number(e.target.value))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Temp Offset (°C)</label>
              <input
                type="number"
                step="0.1"
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {saving ? "Saving to Cloud..." : "Sync to ESP32"}
          </button>
        </form>

        {message && (
          <div className="text-xs text-center p-2 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}