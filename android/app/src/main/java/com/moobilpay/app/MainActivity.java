package com.moobilpay.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static boolean isInstanceAlive = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        isInstanceAlive = true;
        // Création du canal de notification haute priorité
        createNotificationChannel();
    }

    @Override
    public void onDestroy() {
        isInstanceAlive = false;
        super.onDestroy();
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
