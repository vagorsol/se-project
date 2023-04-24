package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ProfileActivity extends AppCompatActivity {
    public static final int COUNTER_ACTIVITY_ID = 1;
    protected String historyLog;
    protected String message;
    protected String username;
    protected String name;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_view);

        TextView usernameView = findViewById(R.id.username);
        TextView contributionView = findViewById(R.id.contribution_history);
        TextView noteView = findViewById(R.id.notes);

        username = getIntent().getStringExtra("username");
        // get the username and contribution history
        try {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.execute(() -> {
                try {

                    URL url = new URL("http://10.0.2.2:3000/contributionHistory?username=" + username);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.connect();

                    Scanner in = new Scanner(url.openStream());
                    String response = in.nextLine();

                    JSONArray jo = new JSONArray(response);
                    historyLog = "";
                    for (int c = 0; c < jo.length(); c++) {
                        JSONObject j = (JSONObject) jo.get(c);
                        String name = "Fund Name:" + j.getString("fundId");
                        String contribution = "\nContribution: $" + j.getString("contribution");
                        String date = "\nDate:" + j.getString("date");
                        historyLog = historyLog + name + contribution + date + "\n\n";
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    message = e.toString();
                }
            });

            // this waits for up to 2 seconds
            executor.awaitTermination(3, TimeUnit.SECONDS);

            // now we can set the status in the TextView
            usernameView.setText("Welcome, " + username);
            contributionView.setText(historyLog);
        } catch (Exception e) {
            // uh oh
            e.printStackTrace();
            usernameView.setText(e.toString());
            contributionView.setText(e.toString());
            noteView.setText(e.toString());
        }
    }



    public void onConnectButtonClick(View view) {
        switch (view.getId()) {
            case R.id.fundOwner:
                Intent i = new Intent(this, RequestOwnership2Activity.class);
                startActivityForResult(i, COUNTER_ACTIVITY_ID);
                break;
            case R.id.back:
                i = new Intent(this, FundsViewActivity.class);
                i.putExtra("message", "true");
                i.putExtra("username", username);
                startActivityForResult(i, COUNTER_ACTIVITY_ID);
                break;
            default:
                break;
        }
    }
}

