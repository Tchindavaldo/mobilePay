package com.moobilpay.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import android.media.AudioAttributes;
import android.provider.Settings;
import android.net.Uri;

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
            String description = "Canal pour les notifications MoobilPay"; // Description
            int importance = NotificationManager.IMPORTANCE_HIGH; // Importance haute pour heads-up

            NotificationChannel channel = new NotificationChannel(
                "moobilpay_channel_v2",  // ID du canal (doit correspondre à votre code ionic)
                "Notifications MoobilPay", // Nom visible
                importance
            );

            // Configuration du son
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();

            // Configuration supplémentaire
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{300, 200, 300}); // Pattern de vibration
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC); // Visible sur écran verrouillé
            channel.setSound(Settings.System.DEFAULT_NOTIFICATION_URI, audioAttributes); // Activer le son par défaut

            // Enregistrement du canal
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
}
