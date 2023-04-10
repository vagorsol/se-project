package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class ProfileActivity extends AppCompatActivity {
    public static final int COUNTER_ACTIVITY_ID = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_view);

        // set header text as username
        Bundle b = getIntent().getExtras();
        String username = b.getString("Username");

        // if no username (i.e., not logged in), will be sent to create an account
        if (username.isEmpty()) {
            Intent i = new Intent(this, CreateAccountActivity.class);
            startActivityForResult(i, COUNTER_ACTIVITY_ID);
        }
        TextView usernameView = findViewById(R.id.username);
        usernameView.setText("Welcome, " + username);
    }
}
