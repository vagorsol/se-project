package edu.brynmawr.cmsc353.webapp;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Spinner;

import androidx.appcompat.app.AppCompatActivity;

public class FundsViewActivity extends AppCompatActivity {
    public static final int COUNTER_ACTIVITY_ID = 1;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.allfunds_view);

        // set up spinner
        Spinner spinner = (Spinner) findViewById(R.id.filter_spinner);

        // Create an ArrayAdapter using the string array and a default spinner layout
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
                R.array.filter_array, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);

        // TODO: implement putting all funds on allfunds_view.xml
    }

    public void onUpdateCounterButtonClick(View v) {
       switch(v.getId()) {
           case R.id.profile:
               // goes to the profile page
               Intent i = new Intent(this, ProfileActivity.class);
               // i.putExtra("User", [insert username here]);
               startActivityForResult(i, COUNTER_ACTIVITY_ID);
               break;
           case R.id.filter:
               // TODO: implement filtering
               break;
           default:
               break;
       }
    }

}
