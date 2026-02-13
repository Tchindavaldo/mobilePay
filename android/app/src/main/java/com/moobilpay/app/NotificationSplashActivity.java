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

        android.util.Log.d("MOOBILPAY_LOG", "🚩 NotificationSplashActivity: onCreate. isInstanceAlive: " + MainActivity.isInstanceAlive);

        if (MainActivity.isInstanceAlive) {
            android.util.Log.d("MOOBILPAY_LOG", "🚩 App already alive, redirecting immediately");
            launchMainActivity(0); // 0ms delay (Warm start)
        } else {
            android.util.Log.d("MOOBILPAY_LOG", "🚩 App closed, showing splash and scheduling redirect in 2.5s");
            setContentView(R.layout.activity_notification_splash);
            launchMainActivity(2500); // 2.5s delay (Cold start)
        }
    }

    private void launchMainActivity(int delay) {
        android.util.Log.d("MOOBILPAY_LOG", "🚩 Scheduling redirect in " + delay + "ms");
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                android.util.Log.d("MOOBILPAY_LOG", "🚩 EXECUTING REDIRECT NOW");
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

    @Override
    protected void onDestroy() {
        android.util.Log.d("MOOBILPAY_LOG", "🚩 NotificationSplashActivity: onDestroy");
        super.onDestroy();
    }
}
