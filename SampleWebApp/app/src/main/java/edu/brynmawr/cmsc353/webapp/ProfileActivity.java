package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class ProfileActivity extends AppCompatActivity implements View.OnClickListener{
    public static final int COUNTER_ACTIVITY_ID = 1;
    //android:onClick="onStartButtonClick"
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_view);

        Button button0 = findViewById(R.id.fundOwner);
        button0.setOnClickListener(this);

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

        // set contribution history
    }

    @Override
    public void onClick(View v) {
        if(v.getId() == R.id.fundOwner) {
            Intent i = new Intent(this, RequestOwnership2Activity.class);

            //String x = this.send;
            //i.putExtra("message",send);

            startActivityForResult(i, COUNTER_ACTIVITY_ID);
        }
    }
}
