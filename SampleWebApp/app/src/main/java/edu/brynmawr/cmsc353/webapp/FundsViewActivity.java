package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import java.net.MalformedURLException;
import java.net.URL;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class FundsViewActivity extends AppCompatActivity implements View.OnClickListener{
    public static final int COUNTER_ACTIVITY_ID = 1;
    ArrayList<String> jObjects = new ArrayList<>();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.allfunds_view);
        EditText editText = (EditText)findViewById(R.id.search);

        // set up spinner
        //Spinner spinner = (Spinner) findViewById(R.id.filter_spinner);

        // Create an ArrayAdapter using the string array and a default spinner layout
        //ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
        //        R.array.filter_array, android.R.layout.simple_spinner_item);
        //adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        //spinner.setAdapter(adapter);

        // TODO: implement putting all funds on allfunds_view.xml
        //Log.d("HERE!",getIntent().getStringExtra("message"));

        Button button0 = findViewById(R.id.profile);
        button0.setOnClickListener(this);

        Button button1 = findViewById(R.id.filter);
        button1.setOnClickListener(this);

        //executor.awaitTermination(10, TimeUnit.SECONDS);
        try {
            ExecutorService executor = Executors.newSingleThreadExecutor();
            //ArrayList<String> jObjects = new ArrayList<>();
            executor.execute( () -> {
                JSONArray jo =null;
                int count = 1;
                try {
                    //http://localhost:3000/allFunds
            URL url = new URL("http://10.0.2.2:3000/allFunds");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.connect();

            Scanner in = new Scanner(url.openStream());
            while(in.hasNextLine() && count<12) {

                String response = in.nextLine();
                //jo = new JSONArray(response);
                //Log.d("this is the line", jo.toString());
                String[] hello = response.split("Name:");
                for(int i=0; i<hello.length; i++){
                    String[] ln = hello[i].split(" ");
                    String hehe = "";
                    for(int z=0; z<6; z++){
                         hehe += ln[z];
                         hehe += " ";
                    }
                    jObjects.add(hehe);
                }
                //jObjects.add(response);


                count++;
            }


        } catch (Exception e) {
            Log.v("hello", e.toString());
        }
            });
            executor.awaitTermination(5, TimeUnit.SECONDS);
            TextView tv = findViewById(R.id.fund1);
            //int count =0;
            for(int i=0; i<jObjects.size(); i++) {
                executor.awaitTermination(5, TimeUnit.SECONDS);
                //deal with if theres more than 11
                if ( i+1 == 1) {
                    tv = findViewById(R.id.fund1);
                }
                if ( i+1 == 2) {
                    tv = findViewById(R.id.fund2);
                }
                if ( i+1 == 3) {
                    tv = findViewById(R.id.fund3);
                }
                if ( i+1 == 4) {
                    tv = findViewById(R.id.fund4);
                }
                if ( i+1 == 5) {
                    tv = findViewById(R.id.fund5);
                }
                if ( i+1 == 6) {
                    tv = findViewById(R.id.fund6);
                }
                if ( i+1 == 7) {
                    tv = findViewById(R.id.fund7);
                }
                if ( i+1 == 8) {
                    tv = findViewById(R.id.fund8);
                }
                if ( i+1 == 9) {
                    tv = findViewById(R.id.fund9);
                }
                if ( i+1 == 10) {
                    tv = findViewById(R.id.fund10);
                }
                if ( i+1 == 11) {
                    tv = findViewById(R.id.fund11);
                }
                tv.setText(jObjects.get(i));
            }
        } catch(Exception e){
            Log.v("hello", e.toString());
        }
    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.profile:
                // goes to the profile page
                if (getIntent().getStringExtra("message").equals("true")) {
                    Intent i = new Intent(this, ProfileActivity.class);
                    // i.putExtra("User", getIntent().getStringExtra("message2"));
                    startActivityForResult(i, COUNTER_ACTIVITY_ID);
                } else if (getIntent().getStringExtra("message").equals("false")) {
                    Intent i = new Intent(this, MainActivity.class);
                    startActivityForResult(i, COUNTER_ACTIVITY_ID);
                }
                break;
            case R.id.filter:
                try {
                    ExecutorService executor = Executors.newSingleThreadExecutor();
                    executor.execute( () -> {
                        TextView tv = findViewById(R.id.fund1);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund2);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund3);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund4);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund5);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund6);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund7);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund8);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund9);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund10);
                        tv.setText(" ");
                        tv = findViewById(R.id.fund11);
                        tv.setText(" ");
                    });
                    executor.awaitTermination(5, TimeUnit.SECONDS);
                    ArrayList<String> atb = new ArrayList<String>();
                    //goes through and figures out if the fund is equal to the fund being search for
                    for(int i=0; i<jObjects.size(); i++){
                        String hehe = jObjects.get(i);
                        String[] a = hehe.split(" ");
                        //i'm not 100% sure that this is the right index
                        if(a[2].equals(editText.getText())){
                            atb.add(hehe);
                        }
                    }
                    TextView tv = findViewById(R.id.fund1);
                    //goes through the arraylist and gets all the funds
                    //figures out which view to put them in depending on the iteration
                    for(int i=0; i<atb.size();i++){
                        executor.awaitTermination(5, TimeUnit.SECONDS);
                        //deal with if theres more than 11
                        if ( i+1 == 1) {
                            tv = findViewById(R.id.fund1);
                        }
                        if ( i+1 == 2) {
                            tv = findViewById(R.id.fund2);
                        }
                        if ( i+1 == 3) {
                            tv = findViewById(R.id.fund3);
                        }
                        if ( i+1 == 4) {
                            tv = findViewById(R.id.fund4);
                        }
                        if ( i+1 == 5) {
                            tv = findViewById(R.id.fund5);
                        }
                        if ( i+1 == 6) {
                            tv = findViewById(R.id.fund6);
                        }
                        if ( i+1 == 7) {
                            tv = findViewById(R.id.fund7);
                        }
                        if ( i+1 == 8) {
                            tv = findViewById(R.id.fund8);
                        }
                        if ( i+1 == 9) {
                            tv = findViewById(R.id.fund9);
                        }
                        if ( i+1 == 10) {
                            tv = findViewById(R.id.fund10);
                        }
                        if ( i+1 == 11) {
                            tv = findViewById(R.id.fund11);
                        }
                        tv.setText(jObjects.get(i));
                    }
                } catch (Exception e) {
                    Log.v("hello", e.toString());
                }
                break;
        }
    }
}
