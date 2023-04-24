package edu.brynmawr.cmsc353.webapp;


import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import java.lang.Math;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

public class AcceptedActivity extends AppCompatActivity{

    public static final int COUNTER_ACTIVITY_ID = 1;
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_accepted);
    }

    public void onConnectButtonClick(View v) {

        TextView tv = findViewById(R.id.homepage);

        Intent i = new Intent(this, MainActivity.class);
        startActivityForResult(i, COUNTER_ACTIVITY_ID);
    }
}
