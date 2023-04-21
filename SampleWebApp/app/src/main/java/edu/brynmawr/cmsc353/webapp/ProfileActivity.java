package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ProfileActivity extends AppCompatActivity implements View.OnClickListener{
    public static final int COUNTER_ACTIVITY_ID = 1;
    protected String message;
    protected String username;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_view);

        Button button0 = findViewById(R.id.fundOwner);
        button0.setOnClickListener(this);

        // if no username (i.e., not logged in), will be sent to create an account
        if (username.isEmpty()) {
            Intent i = new Intent(this, CreateAccountActivity.class);
            startActivityForResult(i, COUNTER_ACTIVITY_ID);
        }

        TextView usernameView = findViewById(R.id.username);
        TextView contributionView = findViewById(R.id.contribution_history);

        // get the username and contribution history
        try {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.execute( () -> {
                try {
                    URL url = new URL("http://10.0.2.2:3000/contributionHistory");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.connect();

                    Scanner in = new Scanner(url.openStream());
                    String response = in.nextLine();

                    JSONObject jo = new JSONObject(response);

                    // TODO: might need to format?
                    message = jo.getString("message");

                    url = new URL("http://10.0.2.2:3000/getUsername");
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.connect();

                    in = new Scanner(url.openStream());
                    response = in.nextLine();

                    jo = new JSONObject(response);

                    username = jo.getString("message");

                }
                catch (Exception e) {
                    e.printStackTrace();
                    message = e.toString();
                }
            });

            // this waits for up to 2 seconds
            // it's a bit of a hack because it's not truly asynchronous
            // but it should be okay for our purposes (and is a lot easier)
            executor.awaitTermination(2, TimeUnit.SECONDS);

            // now we can set the status in the TextView
            usernameView.setText("Welcome, " + username);
            contributionView.setText(message);
        }
        catch (Exception e) {
            // uh oh
            e.printStackTrace();
            usernameView.setText(e.toString());
            contributionView.setText(e.toString());
        }
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
