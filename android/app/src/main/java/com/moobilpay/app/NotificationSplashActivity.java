package com.moobilpay.app;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.appcompat.app.AppCompatActivity;

public class NotificationSplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        android.util.Log.d("NotificationSplash", "Activity started. isInstanceAlive: " + MainActivity.isInstanceAlive);

        if (MainActivity.isInstanceAlive) {
            // L'application est déjà en arrière-plan : redirection immédiate et invisible
            launchMainActivity(0);
        } else {
            // L'application est fermée : on affiche le splash dédié
            setContentView(R.layout.activity_notification_splash);
            launchMainActivity(2500); // 2.5 secondes pour être sûr que tout charge
        }
    }

    private void launchMainActivity(int delay) {
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(NotificationSplashActivity.this, MainActivity.class);
                if (getIntent().getExtras() != null) {
                    intent.putExtras(getIntent().getExtras());
                }
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                startActivity(intent);
                finish();
                
                if (delay > 0) {
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                } else {
                    overridePendingTransition(0, 0); // Pas d'animation pour plus de fluidité
                }
            }
        }, delay);
    }
}
