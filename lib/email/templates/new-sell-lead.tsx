// lib/email/templates/new-sell-lead.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Template email : Notification admin pour nouveau lead VENTE (rachat)
// ─────────────────────────────────────────────────────────────────────────────

interface NewSellLeadEmailProps {
  lead: {
    id: string;
    marque: string;
    modele: string;
    annee: number;
    kilometrage: number;
    carburant: string;
    boite: string;
    etat: string;
    carnet: string;
    accident: string;
    commentaire?: string | null;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    createdAt: Date;
  };
}

export function generateSellLeadEmail({ lead }: NewSellLeadEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const backOfficeUrl = `${appUrl}/admin/leads/sell/${lead.id}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande de rachat - VL Automobiles</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4EDDF;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4EDDF;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Card principale -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 600px;">
          
          <!-- Header violet -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 900;">
                💰 Nouvelle demande de rachat
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600;">
                Un vendeur souhaite vous racheter son véhicule
              </p>
            </td>
          </tr>
          
          <!-- Contenu -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Véhicule à racheter -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px; background-color: #F4EDDF; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 18px; font-weight: 900;">
                      🚙 Véhicule à racheter
                    </h2>
                    
                    <p style="margin: 0 0 4px 0; color: #666666; font-size: 13px; text-transform: uppercase;">
                      ${lead.marque}
                    </p>
                    <h3 style="margin: 0 0 16px 0; color: #000000; font-size: 20px; font-weight: 900;">
                      ${lead.modele}
                    </h3>
                    
                    <!-- Grid 2 colonnes -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="50%" style="padding: 8px 8px 8px 0;">
                          <strong style="color: #666666; font-size: 12px; text-transform: uppercase; display: block;">Année</strong>
                          <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.annee}</span>
                        </td>
                        <td width="50%" style="padding: 8px 0 8px 8px;">
                          <strong style="color: #666666; font-size: 12px; text-transform: uppercase; display: block;">Kilométrage</strong>
                          <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.kilometrage.toLocaleString('fr-FR')} km</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 8px 8px 8px 0;">
                          <strong style="color: #666666; font-size: 12px; text-transform: uppercase; display: block;">Carburant</strong>
                          <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.carburant}</span>
                        </td>
                        <td width="50%" style="padding: 8px 0 8px 8px;">
                          <strong style="color: #666666; font-size: 12px; text-transform: uppercase; display: block;">Boîte</strong>
                          <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.boite}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- État du véhicule -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px; background-color: #F9F9F9; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 18px; font-weight: 900;">
                      🔍 État du véhicule
                    </h2>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">État général</strong><br>
                      <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.etat}</span>
                    </p>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Carnet d'entretien</strong><br>
                      <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.carnet}</span>
                    </p>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Historique accident</strong><br>
                      <span style="color: #000000; font-size: 15px; font-weight: 600;">${lead.accident}</span>
                    </p>
                    
                    ${lead.commentaire ? `
                    <p style="margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #E5E5E5;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Commentaire</strong><br>
                      <span style="color: #000000; font-size: 14px; line-height: 1.6;">${lead.commentaire}</span>
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- Coordonnées vendeur -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px; background-color: #FFF4ED; border-radius: 12px; padding: 20px; border-left: 4px solid #FF8633;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 18px; font-weight: 900;">
                      👤 Coordonnées du vendeur
                    </h2>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Nom complet</strong><br>
                      <span style="color: #000000; font-size: 16px; font-weight: 600;">${lead.prenom} ${lead.nom}</span>
                    </p>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Téléphone</strong><br>
                      <a href="tel:${lead.telephone}" style="color: #FF8633; font-size: 18px; font-weight: 900; text-decoration: none;">
                        ${lead.telephone}
                      </a>
                    </p>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Email</strong><br>
                      <a href="mailto:${lead.email}" style="color: #FF8633; font-size: 15px; font-weight: 600; text-decoration: none;">
                        ${lead.email}
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA principal -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${backOfficeUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 900; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      📊 Voir dans le back office
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E5E5;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      VL Automobiles - Mandataire automobile<br>
                      Reçu le ${new Date(lead.createdAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}