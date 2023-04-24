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

public class ProfileActivity extends AppCompatActivity implements View.OnClickListener{
    public static final int COUNTER_ACTIVITY_ID = 1;
    protected String historyLog;
    protected String message;
    protected String username;
    protected String name;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_view);

        Button button0 = findViewById(R.id.fundOwner);
        button0.setOnClickListener(this);

        TextView usernameView = findViewById(R.id.username);
        TextView contributionView = findViewById(R.id.contribution_history);
        TextView noteView = findViewById(R.id.notes);


        // get the username and contribution history
        try {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.execute( () -> {
                try {
                    URL url = new URL("http://10.0.2.2:3000/contributionHistory?username=" + username);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.connect();

                    Scanner in = new Scanner(url.openStream());
                    String response = in.nextLine();

                    JSONArray jo = new JSONArray(response);

                    //Log.v("help", jo.toString());


                    for (int i=0; i < jo.length(); i++){
                        JSONObject j = (JSONObject) jo.get(i);
                        String name = "Fund Name:" + j.getString("fundId");
                        String contribution = "Contribution: " + j.getString("contribution");
                        String date = "Date:" + j.getString("date");
                        historyLog = historyLog + name + contribution + date + "\n";
                    }

                    url = new URL("http://10.0.2.2:3000/getUsername?username=" + username);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.connect();

                    in = new Scanner(url.openStream());
                    response = in.nextLine();

                    JSONObject job = new JSONObject(response);
                    //name = job.getString("name");

                }
                catch (Exception e) {
                    e.printStackTrace();
                    message = e.toString();
                }
            });

            // this waits for up to 2 seconds
            executor.awaitTermination(2, TimeUnit.SECONDS);
            username = getIntent().getStringExtra("username");
            // now we can set the status in the TextView
            usernameView.setText("Welcome, " + username);
            contributionView.setText(historyLog);
        }
        catch (Exception e) {
            // uh oh
            e.printStackTrace();
            usernameView.setText(e.toString());
            contributionView.setText(e.toString());
            noteView.setText(e.toString());
        }
    }


    @Override
    public void onClick(View view) {
        if(view.getId() == R.id.fundOwner) {
            Intent i = new Intent(this, RequestOwnership2Activity.class);

            startActivityForResult(i, COUNTER_ACTIVITY_ID);
        }
        if(view.getId() == R.id.back) {
            Intent i = new Intent(this, FundsViewActivity.class);
            i.putExtra("message", "true");
            i.putExtra("username", username);
            startActivityForResult(i, COUNTER_ACTIVITY_ID);
        }
    }
}
