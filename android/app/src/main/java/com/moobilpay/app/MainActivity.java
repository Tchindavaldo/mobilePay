package com.moobilpay.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // IMPORTANT: Ne pas changer le thème ici pour garder le splash screen visible
        // Le thème AppTheme.NoActionBarLaunch du manifest affiche automatiquement le splash
        // Capacitor le masquera après l'initialisation complète
        
        super.onCreate(savedInstanceState);
        
        // Création du canal de notification haute priorité
        createNotificationChannel();
    }

    @Override
    public void onStart() {
        super.onStart();
        
        // Rendre la WebView transparente pour que le splash screen soit visible
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().setBackgroundColor(android.graphics.Color.TRANSPARENT);
        }
    }

    private void createNotificationChannel() {
        // Création seulement pour API 26+ (Android 8.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "High priority notifications"; // Nom visible dans les paramètres
            String description = "For important notifications"; // Description
            int importance = NotificationManager.IMPORTANCE_HIGH; // Importance haute pour heads-up

            NotificationChannel channel = new NotificationChannel(
                "high_priority_channel",  // ID du canal (doit correspondre à votre code ionic)
                name,
                importance
            );

            // Configuration supplémentaire
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{300, 200, 300}); // Pattern de vibration
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC); // Visible sur écran verrouillé

            // Enregistrement du canal
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
}
