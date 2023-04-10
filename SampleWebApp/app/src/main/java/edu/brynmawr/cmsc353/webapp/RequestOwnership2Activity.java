package edu.brynmawr.cmsc353.webapp;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
public class RequestOwnership2Activity extends AppCompatActivity{
    public static final int COUNTER_ACTIVITY_ID = 1;
    //This is where the fund name will go
    EditText editText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.request_ownership2);

        //set this to the fund text
        editText = (EditText) findViewById(R.id.fund2);

    }
    //going to contain what is written into the editText
    protected String message;

    public void onConnectButtonClick(View v) {

        TextView tv = findViewById(R.id.statusField);

        try {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            executor.execute( () -> {
                        try {
                            // assumes that there is a server running on the AVD's host on port 3000
                            // and that it has a /test endpoint that returns a JSON object with
                            // a field called "message"

                            //now message has the fund name
                            message = editText.getText().toString();

                            //should create an object with the message and aburgess
                            URL url = new URL("http://10.0.2.2:3000/newFundForm?name=" + message + "&user=aburgess" );

                            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                            conn.setRequestMethod("GET");
                            conn.connect();

                            Scanner in = new Scanner(url.openStream());

                        }
                        catch (Exception e) {
                            e.printStackTrace();
                            message = e.toString();
                        }
                    }
            );
            // this waits for up to 2 seconds
            // it's a bit of a hack because it's not truly asynchronous
            // but it should be okay for our purposes (and is a lot easier)
            executor.awaitTermination(30, TimeUnit.SECONDS);

            Intent i = new Intent(this, AcceptedActivity.class);

            //String x = this.send;
            i.putExtra("message",message);

            startActivityForResult(i, COUNTER_ACTIVITY_ID);
        }
        catch (Exception e) {
            // uh oh
            e.printStackTrace();
            tv.setText(e.toString());
        }
    }
}

