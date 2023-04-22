package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;


import androidx.appcompat.app.AppCompatActivity;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class DonateActivity extends AppCompatActivity {
    public static final int COUNTER_ACTIVITY_ID = 1;
    private Spinner spinner;
    private String fundname;
    private String username;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.donate_view);

        // get & set donation name
        Bundle b = getIntent().getExtras();
        fundname = b.getString("Fund Name");

        TextView tv = findViewById(R.id.fund_name);
        tv.setText(fundname);

        // set up spinner
        spinner = (Spinner) findViewById(R.id.donation_amt);

        // Create an ArrayAdapter using the string array and a default spinner layout
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
                R.array.donation_values, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);

    }

    public void onUpdateCounterButtonClick(View v) {
        Intent i;
        switch(v.getId()) {
            case R.id.submit:
                // get donation amount
                String donationStr = spinner.getSelectedItem().toString();
                int donationAmt = Integer.parseInt(donationStr);

                // use "giveToFund" endpoint
                try {
                    ExecutorService executor = Executors.newSingleThreadExecutor();
                    executor.execute( () -> {
                        try {
                            URL url = new URL("http://10.0.2.2:3000/addToFund?fund="
                                    + fundname + "&donation=" + donationAmt);
                            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                            conn.setRequestMethod("GET");
                            conn.connect();

                            Scanner in = new Scanner(url.openStream());

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    });

                    // this waits for up to 2 seconds
                    executor.awaitTermination(2, TimeUnit.SECONDS);
                }
                catch (Exception e) {
                    e.printStackTrace();
                }

                // redirects back to allfunds_view
                i = new Intent(this, FundsViewActivity.class);
                startActivityForResult(i, COUNTER_ACTIVITY_ID);
                break;
            case R.id.fundOwner:
                // check if this redirects to the correct request page
                i = new Intent(this, RequestOwnership2Activity.class);
                startActivityForResult(i, COUNTER_ACTIVITY_ID);
                break;
            case R.id.back:
                i = new Intent(this, FundsViewActivity.class);
                startActivityForResult(i, COUNTER_ACTIVITY_ID);
                break;
            default:
                break;
        }
    }
}
