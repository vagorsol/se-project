package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class CreateAccountActivity extends AppCompatActivity{
    public static final int COUNTER_ACTIVITY_ID = 1;
    EditText usernameText;
    EditText passwordText;
    EditText nameText;
    protected String username;
    protected String password;
    protected String name;
    protected String message;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.create_account);

        usernameText = (EditText) findViewById(R.id.username);
        passwordText = (EditText) findViewById(R.id.password);
        nameText = (EditText) findViewById(R.id.name);
    }

    // Account Info Submitted
    public void onConnectButtonClick(View v) {
        Log.v("Button Clicked", "Button: " + v.getId());

        switch(v.getId()) {
            case R.id.create:
                TextView tv = findViewById(R.id.create);
                try {
                    ExecutorService executor = Executors.newSingleThreadExecutor();
                    executor.execute(() -> {
                        try {
                            // assumes that there is a server running on the AVD's host on port 3000
                            // and that it has a /test endpoint that returns a JSON object with
                            // a field called "message"

                            username = usernameText.getText().toString();
                            password = passwordText.getText().toString();
                            name = nameText.getText().toString();

                            URL url = new URL("http://10.0.2.2:3000/newUserAndroid?username=" + username + "&password=" + password + "&name=" + name);

                            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                            conn.setRequestMethod("GET");
                            conn.connect();

                            Scanner in = new Scanner(url.openStream());
                            String response = in.nextLine();

                            JSONObject jo = new JSONObject(response);
                            message = jo.getString("status");

                        } catch (Exception e) {
                            e.printStackTrace();
                            message = e.toString();
                        }
                    });

                    // this waits for up to 2 seconds
                    // it's a bit of a hack because it's not truly asynchronous
                    // but it should be okay for our purposes (and is a lot easier)
                    executor.awaitTermination(2, TimeUnit.SECONDS);

                    // now we can set the status in the TextView

                    if (message.equals("success")) {
                        tv.setText("Success, Account Created!!");
                        Intent i = new Intent(this, FundsViewActivity.class);
                        startActivityForResult(i, COUNTER_ACTIVITY_ID);
                    } else if (message.equals("failure")) {
                        tv.setText("Failure, Please Change Username!");
                        Intent i = new Intent(this, CreateAccountActivity.class);
                        startActivityForResult(i, COUNTER_ACTIVITY_ID);
                    }
                } catch (Exception e) {

                    e.printStackTrace();
                    tv.setText(e.toString());
                }
                break;

            case R.id.homepage:
                Intent i = new Intent(this, MainActivity.class);
                startActivityForResult(i, COUNTER_ACTIVITY_ID);
                break;
            default:
                break;
        }
    }
}
