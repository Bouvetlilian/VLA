// app/admin/settings/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Paramètres administrateur - Back office admin
// Profil, changement mot de passe, 2FA, gestion des admins (SUPER_ADMIN)
// TOUTES LES APIS CONNECTÉES ✅
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils/format";
import QRCode from "qrcode";

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
  const { data: session, update: updateSession } = useSession();
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
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);

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
      setTwoFactorEnabled(session.user.twoFactorEnabled || false);
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

  // ─────────────────────────────────────────────────────────────────────────
  // PROFIL
  // ─────────────────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      alert("Le nom ne peut pas être vide");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profil mis à jour avec succès !");
        // Mettre à jour la session
        await updateSession();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSavingProfile(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MOT DE PASSE
  // ─────────────────────────────────────────────────────────────────────────

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Tous les champs sont requis");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      alert("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Mot de passe changé avec succès !");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors du changement de mot de passe");
      console.error(error);
    } finally {
      setSavingPassword(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 2FA - ACTIVATION
  // ─────────────────────────────────────────────────────────────────────────

  const handleEnable2FA = async () => {
    setEnabling2FA(true);
    try {
      const response = await fetch("/api/admin/2fa/enable", {
        method: "POST",
      });

      const data = await response.json();
      console.log("🔍 Réponse API 2FA:", data);

      if (response.ok) {
        // Générer le QR code en Data URI à partir de l'URL otpauth
        console.log("🔍 URL otpauth:", data.qrCodeUrl);
        
        const qrCodeDataUrl = await QRCode.toDataURL(data.qrCodeUrl, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: "M",
        });
        
        console.log("🔍 QR Code généré:", qrCodeDataUrl.substring(0, 50) + "...");
        
        setQrCodeUrl(qrCodeDataUrl);
        setSecret(data.secret);
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Erreur complète:", error);
      alert("Erreur lors de la génération du QR code");
    } finally {
      setEnabling2FA(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 2FA - VÉRIFICATION ET ACTIVATION
  // ─────────────────────────────────────────────────────────────────────────

  const handleVerify2FA = async () => {
    if (totpCode.length !== 6) {
      alert("Le code doit contenir 6 chiffres");
      return;
    }

    setVerifying2FA(true);
    try {
      const response = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: totpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("2FA activé avec succès ! Votre compte est maintenant sécurisé.");
        setTwoFactorEnabled(true);
        setQrCodeUrl("");
        setSecret("");
        setTotpCode("");
        // Mettre à jour la session
        await updateSession();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la vérification du code");
      console.error(error);
    } finally {
      setVerifying2FA(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 2FA - DÉSACTIVATION
  // ─────────────────────────────────────────────────────────────────────────

  const handleDisable2FA = async () => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver le 2FA ? Votre compte sera moins sécurisé.")) {
      return;
    }

    const password = prompt("Entrez votre mot de passe pour confirmer :");
    if (!password) return;

    setDisabling2FA(true);
    try {
      const response = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("2FA désactivé avec succès");
        setTwoFactorEnabled(false);
        // Mettre à jour la session
        await updateSession();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la désactivation du 2FA");
      console.error(error);
    } finally {
      setDisabling2FA(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GESTION ADMINS
  // ─────────────────────────────────────────────────────────────────────────

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

      const data = await response.json();

      if (response.ok) {
        alert("Administrateur créé avec succès !");
        setShowNewAdminForm(false);
        setNewAdminEmail("");
        setNewAdminName("");
        setNewAdminPassword("");
        setNewAdminRole("ADMIN");
        loadAdmins();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la création");
      console.error(error);
    } finally {
      setCreatingAdmin(false);
    }
  };

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
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      alert("Erreur lors de la modification");
      console.error(error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "password", label: "Mot de passe", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { id: "2fa", label: "2FA", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  ];

  if (isSuperAdmin) {
    tabs.push({
      id: "admins",
      label: "Administrateurs",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-black text-3xl text-vla-black mb-2">
          Paramètres
        </h1>
        <p className="text-gray-500 font-semibold">
          Gérez votre profil, sécurité et préférences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 mb-6 shadow-lg">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-vla-orange text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        {/* TAB: Profil */}
        {activeTab === "profile" && (
          <div>
            <h2 className="font-black text-xl text-vla-black mb-6">
              Informations du profil
            </h2>

            <div className="space-y-4 mb-6">
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rôle
                </label>
                <input
                  type="text"
                  value={session?.user?.role === "SUPER_ADMIN" ? "Super Administrateur" : "Administrateur"}
                  disabled
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        )}

        {/* TAB: Mot de passe */}
        {activeTab === "password" && (
          <div>
            <h2 className="font-black text-xl text-vla-black mb-6">
              Changer le mot de passe
            </h2>

            <div className="space-y-4 mb-6">
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
                  Minimum 8 caractères avec au moins une majuscule, une minuscule et un chiffre
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
            </div>

            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {savingPassword ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
          </div>
        )}

        {/* TAB: 2FA */}
        {activeTab === "2fa" && (
          <div>
            <h2 className="font-black text-xl text-vla-black mb-6">
              Authentification à deux facteurs (2FA)
            </h2>

            {!twoFactorEnabled ? (
              <div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-sm font-bold text-blue-700 mb-2">
                    🔒 Sécurisez votre compte
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
                    {enabling2FA ? "Génération..." : "Activer le 2FA"}
                  </button>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-4">
                      Scannez ce QR code avec votre application d'authentification :
                    </p>
                    
                    {/* QR Code */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4 text-center">
                      {qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code 2FA"
                          className="mx-auto"
                          style={{ width: 200, height: 200 }}
                          onError={(e) => {
                            console.error("❌ Erreur chargement image QR code");
                            e.currentTarget.style.display = "none";
                          }}
                          onLoad={() => console.log("✅ QR code chargé avec succès")}
                        />
                      ) : (
                        <div className="w-[200px] h-[200px] mx-auto flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-vla-orange border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Secret manuel */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-gray-600 mb-1">
                        Ou entrez manuellement ce code :
                      </p>
                      <p className="font-mono text-sm text-gray-700 break-all">
                        {secret}
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Entrez le code à 6 chiffres pour valider
                      </label>
                      <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-vla-orange outline-none font-mono text-center text-2xl"
                        placeholder="000000"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleVerify2FA}
                        disabled={totpCode.length !== 6 || verifying2FA}
                        className="px-6 py-3 bg-vla-orange text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        {verifying2FA ? "Vérification..." : "Valider et activer"}
                      </button>

                      <button
                        onClick={() => {
                          setQrCodeUrl("");
                          setSecret("");
                          setTotpCode("");
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
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
                  onClick={handleDisable2FA}
                  disabled={disabling2FA}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {disabling2FA ? "Désactivation..." : "Désactiver le 2FA"}
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
                        placeholder="Jean Dupont"
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
                        placeholder="jean@vl-automobiles.fr"
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
                        placeholder="Min. 8 caractères"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Majuscule + minuscule + chiffre
                      </p>
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
                        <option value="SUPER_ADMIN">Super Administrateur</option>
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