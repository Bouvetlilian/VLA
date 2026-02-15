// lib/email/templates/new-buy-lead.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Template email : Notification admin pour nouveau lead ACHAT
// ─────────────────────────────────────────────────────────────────────────────

interface NewBuyLeadEmailProps {
  lead: {
    id: string;
    prenom: string;
    telephone: string;
    message?: string | null;
    createdAt: Date;
  };
  vehicle: {
    id: number;
    marque: string;
    modele: string;
    annee: number;
    prix: number;
    slug: string;
  };
}

export function generateBuyLeadEmail({ lead, vehicle }: NewBuyLeadEmailProps): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const backOfficeUrl = `${appUrl}/admin/leads/buy/${lead.id}`;
  const vehicleUrl = `${appUrl}/acheter/${vehicle.slug}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande d'achat - VL Automobiles</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4EDDF;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F4EDDF;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Card principale -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 600px;">
          
          <!-- Header orange -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF8633 0%, #FF6B1A 100%); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 900;">
                🚗 Nouvelle demande d'achat
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 600;">
                Un prospect souhaite acheter un véhicule
              </p>
            </td>
          </tr>
          
          <!-- Contenu -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Infos prospect -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px; background-color: #F4EDDF; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 18px; font-weight: 900;">
                      👤 Informations du prospect
                    </h2>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Prénom</strong><br>
                      <span style="color: #000000; font-size: 16px; font-weight: 600;">${lead.prenom}</span>
                    </p>
                    
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Téléphone</strong><br>
                      <a href="tel:${lead.telephone}" style="color: #FF8633; font-size: 18px; font-weight: 900; text-decoration: none;">
                        ${lead.telephone}
                      </a>
                    </p>
                    
                    ${lead.message ? `
                    <p style="margin: 8px 0;">
                      <strong style="color: #666666; font-size: 13px; text-transform: uppercase;">Message</strong><br>
                      <span style="color: #000000; font-size: 14px; line-height: 1.6;">${lead.message}</span>
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              <!-- Véhicule concerné -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px; background-color: #F9F9F9; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #000000; font-size: 18px; font-weight: 900;">
                      🚙 Véhicule concerné
                    </h2>
                    
                    <p style="margin: 0 0 4px 0; color: #666666; font-size: 13px; text-transform: uppercase;">
                      ${vehicle.marque}
                    </p>
                    <h3 style="margin: 0 0 12px 0; color: #000000; font-size: 20px; font-weight: 900;">
                      ${vehicle.modele}
                    </h3>
                    
                    <p style="margin: 8px 0;">
                      <span style="color: #666666; font-size: 14px; margin-right: 16px;">📅 ${vehicle.annee}</span>
                      <span style="color: #FF8633; font-size: 18px; font-weight: 900;">
                        ${vehicle.prix.toLocaleString('fr-FR')} €
                      </span>
                    </p>
                    
                    <p style="margin: 16px 0 0 0;">
                      <a href="${vehicleUrl}" style="color: #FF8633; font-size: 14px; font-weight: 600; text-decoration: none;">
                        → Voir la fiche véhicule
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA principal -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${backOfficeUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF8633 0%, #FF6B1A 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 900; box-shadow: 0 4px 12px rgba(255, 134, 51, 0.3);">
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