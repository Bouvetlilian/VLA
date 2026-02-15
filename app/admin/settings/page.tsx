// app/admin/settings/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Paramètres administrateur - Back office admin
// Profil, changement mot de passe, 2FA, gestion des admins (SUPER_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils/format";

type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [activeTab, setActiveTab] = useState("profile");
  
  // État profil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // État mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // État 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [enabling2FA, setEnabling2FA] = useState(false);

  // État admins
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("ADMIN");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      // TODO: Charger twoFactorEnabled depuis l'API
    }
  }, [session]);

  // Charger la liste des admins (si SUPER_ADMIN)
  useEffect(() => {
    if (isSuperAdmin && activeTab === "admins") {
      loadAdmins();
    }
  }, [isSuperAdmin, activeTab]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await fetch("/api/admin/admins");
      const data = await response.json();
      if (response.ok) {
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // TODO: Appeler API pour update profil
      alert("Profil mis à jour (API à implémenter)");
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSavingProfile(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setSavingPassword(true);
    try {
      // TODO: Appeler API pour changer mot de passe
      alert("Mot de passe changé (API à implémenter)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert("Erreur lors du changement de mot de passe");
    } finally {
      setSavingPassword(false);
    }
  };

  // Activer 2FA
  const handleEnable2FA = async () => {
    setEnabling2FA(true);
    try {
      // TODO: Appeler API pour générer QR code
      // const response = await fetch("/api/admin/2fa/enable", { method: "POST" });
      // const data = await response.json();
      // setQrCodeUrl(data.qrCodeUrl);
      alert("2FA à implémenter - Génération QR code");
    } catch (error) {
      alert("Erreur lors de l'activation 2FA");
    } finally {
      setEnabling2FA(false);
    }
  };

  // Créer un admin
  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminName || !newAdminPassword) {
      alert("Tous les champs sont requis");
      return;
    }

    setCreatingAdmin(true);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          password: newAdminPassword,
          role: newAdminRole,
        }),
      });

      if (response.ok) {
        alert("Administrateur créé avec succès");
        setShowNewAdminForm(false);
        setNewAdminEmail("");
        setNewAdminName("");
        setNewAdminPassword("");
        setNewAdminRole("ADMIN");
        loadAdmins();
      } else {
        const data = await response.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la création");
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Toggle admin actif/inactif
  const handleToggleAdmin = async (adminId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, isActive: !isActive }),
      });

      if (response.ok) {
        loadAdmins();
      } else {
        const data = await response.json();
        alert(`Erreur: ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "password", label: "Mot de passe", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { id: "2fa", label: "2FA", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  ];

  if (isSuperAdmin) {
    tabs.push({ id: "admins", label: "Gestion admins", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl text-vla-black mb-2">
          Paramètres
        </h1>
        <p className="text-gray-500 font-semibold">
          Gérez votre profil et vos préférences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-vla-orange text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        {/* TAB: Profil */}
        {activeTab === "profile" && (
          <div>
            <h2 className="font-black text-xl text-vla-black mb-6">
              Informations du profil
            </h2>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-vla-orange flex items-center justify-center text-white font-black text-2xl">
                {getInitials(name)}
              </div>
              <div>
                <p className="font-bold text-lg text-vla-black">{name}</p>
                <p className="text-sm text-gray-500">{email}</p>
                <p className="text-xs font-bold text-vla-orange mt-1">
                  {session?.user?.role === "SUPER_ADMIN" ? "Super Administrateur" : "Administrateur"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {savingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        )}

        {/* TAB: Mot de passe */}
        {activeTab === "password" && (
          <div>
            <h2 className="font-black text-xl text-vla-black mb-6">
              Changer le mot de passe
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {savingPassword ? "Changement..." : "Changer le mot de passe"}
              </button>
            </div>
          </div>
        )}

        {/* TAB: 2FA */}
        {activeTab === "2fa" && (
          <div>
            <h2 className="font-black text-xl text-vla-black mb-6">
              Authentification à deux facteurs
            </h2>

            {!twoFactorEnabled ? (
              <div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-sm font-semibold text-blue-700 mb-2">
                    ℹ️ Qu'est-ce que le 2FA ?
                  </p>
                  <p className="text-sm text-blue-600">
                    L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                    Vous devrez scanner un QR code avec une application comme Google Authenticator.
                  </p>
                </div>

                {!qrCodeUrl ? (
                  <button
                    onClick={handleEnable2FA}
                    disabled={enabling2FA}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {enabling2FA ? "Activation..." : "Activer le 2FA"}
                  </button>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-4">
                      Scannez ce QR code avec votre application d'authentification :
                    </p>
                    {/* QR Code sera affiché ici */}
                    <div className="bg-gray-100 rounded-xl p-6 mb-4 text-center">
                      <p className="text-gray-500">QR Code (à implémenter)</p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Entrez le code à 6 chiffres pour valider
                      </label>
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none font-mono text-center text-2xl"
                        placeholder="000000"
                      />
                    </div>

                    <button
                      disabled={totpCode.length !== 6}
                      className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      Valider et activer
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <p className="text-sm font-bold text-green-700 mb-2">
                    ✓ 2FA activé
                  </p>
                  <p className="text-sm text-green-600">
                    Votre compte est protégé par l'authentification à deux facteurs.
                  </p>
                </div>

                <button
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Désactiver le 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: Gestion admins (SUPER_ADMIN only) */}
        {activeTab === "admins" && isSuperAdmin && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-xl text-vla-black">
                Gestion des administrateurs
              </h2>

              <button
                onClick={() => setShowNewAdminForm(!showNewAdminForm)}
                className="px-4 py-2 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
              >
                {showNewAdminForm ? "Annuler" : "+ Nouvel admin"}
              </button>
            </div>

            {/* Formulaire nouveau admin */}
            {showNewAdminForm && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Créer un administrateur</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Rôle
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none"
                      >
                        <option value="ADMIN">Administrateur</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateAdmin}
                    disabled={creatingAdmin}
                    className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {creatingAdmin ? "Création..." : "Créer l'administrateur"}
                  </button>
                </div>
              </div>
            )}

            {/* Liste des admins */}
            {loadingAdmins ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-vla-orange flex items-center justify-center text-white font-black">
                        {getInitials(admin.name)}
                      </div>

                      <div>
                        <p className="font-bold text-vla-black">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs font-bold text-vla-orange">
                            {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                          </span>
                          {admin.twoFactorEnabled && (
                            <span className="text-xs font-bold text-green-600">• 2FA</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAdmin(admin.id, admin.isActive)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                          admin.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {admin.isActive ? "Actif" : "Inactif"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}