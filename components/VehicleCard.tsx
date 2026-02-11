"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Vehicle } from "@/lib/data";

// ─── Composant ────────────────────────────────────────────────────────────────

export default function VehicleCard({
  vehicle,
  index = 0,
}: {
  vehicle: Vehicle;
  index?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/acheter/${vehicle.id}`}
      className="group block bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.12)"
          : "0 4px 20px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-4px)" : "translateY(0px)",
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <Image
          src={vehicle.images[0]}
          alt={`${vehicle.marque} ${vehicle.modele}`}
          fill
          className="object-cover"
          style={{
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient bas pour lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 50%)",
          }}
        />

        {/* Badge optionnel */}
        {vehicle.badge && (
          <div className="absolute top-3 left-3">
            <span className="bg-vla-orange text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
              {vehicle.badge}
            </span>
          </div>
        )}

        {/* Pill carburant */}
        <div className="absolute bottom-3 right-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#FF8633",
              backdropFilter: "blur(4px)",
            }}
          >
            {vehicle.carburant}
          </span>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="p-5">
        {/* Marque + Modèle */}
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">
            {vehicle.marque}
          </p>
          <h3 className="font-black text-xl text-vla-black leading-tight">
            {vehicle.modele}
          </h3>
        </div>

        {/* Séparateur gradient */}
        <div
          className="h-px mb-4"
          style={{
            background: "linear-gradient(to right, #FF8633, transparent)",
            opacity: 0.3,
          }}
        />

        {/* Prix */}
        <div className="mb-4">
          <span className="font-black text-3xl text-vla-orange">
            {vehicle.prix.toLocaleString("fr-FR")}
          </span>
          <span className="text-sm font-semibold text-gray-400 ml-1">€</span>
        </div>

        {/* Stats : année / km / boîte */}
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-sm font-semibold text-gray-500">
              {vehicle.annee}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <span className="text-sm font-semibold text-gray-500">
              {vehicle.kilometrage.toLocaleString("fr-FR")} km
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-semibold text-gray-500">
              {vehicle.boite}
            </span>
          </div>
        </div>

        {/* CTA animé au hover */}
        <div
          className="mt-5 flex items-center justify-between"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(6px)",
            transition: "all 0.25s ease",
          }}
        >
          <span className="text-sm font-black text-vla-orange">
            Voir le détail
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8633"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}