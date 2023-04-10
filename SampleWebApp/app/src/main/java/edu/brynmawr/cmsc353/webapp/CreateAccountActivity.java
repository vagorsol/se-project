package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class CreateAccountActivity extends AppCompatActivity{
    // TODO: better variable names
    EditText usernameText;
    EditText passwordText;
    protected String message;
    protected String message2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.create_account);
    }

    // Account Info Submitted
    public void onClick(View v) {
        // TODO: change this text so it fits the "create account" specificity
        TextView tv = findViewById(R.id.login);
        try {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.execute( () -> {
                try {
                    // assumes that there is a server running on the AVD's host on port 3000
                    // and that it has a /test endpoint that returns a JSON object with
                    // a field called "message"

                    message = usernameText.getText().toString();
                    message2 = passwordText.getText().toString();


                    URL url = new URL("http://10.0.2.2:3000/create?name=" + message + "&user=" + message2 );

                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.connect();

                    Scanner in = new Scanner(url.openStream());

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
            tv.setText( "added: " + message + " " + message2 );
        } catch (Exception e) {

            e.printStackTrace();
            tv.setText(e.toString());
        }
    }
}
