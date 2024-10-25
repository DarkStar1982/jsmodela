function run_code(){
    var code = editor.getValue();
    var input_variables = table1.getTableValues();
    var output_variables = table2.getTableValues();
    code = input_variables + output_variables + code;

    var initFunc = function(interpreter, globalObject) {
    //interpreter.setProperty(globalObject, 'b', String());

        var wrapper = function update_dom_outputs(p_name, p_value) {
            var dom_objects = table2.getTableValues(1);
            var table_id = dom_objects[p_name][0];
            var inputElement = document.getElementById(table_id);
            inputElement.value = p_value;

        };
        interpreter.setProperty(globalObject, 'update_dom_outputs', interpreter.createNativeFunction(wrapper));
    };
    var outputs = table2.getTableValues(2);
    code = code + "\n";
    //filter for unsupported features
    outputs.forEach(function(element){
        code = code + 'update_dom_outputs('+'"'+element+'"'+','+element+');\n';
    });
    code = code.replaceAll("let ", "var ");
    try
    {
        document.getElementById("last_error").innerHTML='';
        var myInterpreter = new Interpreter(code, initFunc);   
        myInterpreter.run();
    }
    catch(err) { 
        document.getElementById("last_error").innerHTML=err;
    }

}

class SymbolTable {
    constructor(containerId, rowsOnCreate = 12, read_only = false) {
        this.container = document.getElementById(containerId);
        this.tableBody = this.container.querySelector('.table-body');
        this.tbody = this.tableBody.querySelector('tbody');
        this.rowCount = 0;
        this.table_id = containerId + "_table_";
        this.readOnly = read_only;
        this.loadMoreRows(rowsOnCreate, read_only);
        this.tbody.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    getTableValues(mode=0)
    {
        var values="";
        var raw_names = [];
        var symbol_table={};
        // Get all rows in the table body
        const rows = this.tbody.querySelectorAll('tr');

        // Iterate through each row
        rows.forEach((row, index) => {
        // Get all cells in the current row
            const cells = row.querySelectorAll('td');

            const name_element =  cells[0].querySelector('input');
            var nameInput = name_element.value;
            var value_element = cells[1].querySelector('input');
            var valueInput = value_element.value;
            if (nameInput!="")  
            {
                raw_names.push(nameInput);
                if (this.readOnly)
                {
                    values = values + "var " + nameInput+";\n";
                    symbol_table[nameInput] = [value_element.id, ""];
                }
                else
                {
                    values = values + "var " + nameInput +  " = " + valueInput + ";\n";
                    symbol_table[nameInput] = [value_element.id, valueInput];
                }
            }
        });
        if (mode==0)
            return values;
        if (mode==1)
            return symbol_table;
        if (mode==2)
            return raw_names;
    }

    createRow(read_only, key='', value='') {
        const row = document.createElement('tr');

        var focus_id;
        for (let i = 0; i < 2; i++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = '';
            if ((read_only)&&(i==1))
            {
                input.readOnly = true;
                cell.style.backgroundColor = '#EFEFEF';
            }
            if (i==0) 
            {
                input.id = this.table_id + this.rowCount+"_name"
                focus_id = input.id;
                if (key!='') input.value = key;

            }
            if (i==1) 
            {
                    input.id = this.table_id + this.rowCount+"_value";
                    if (value != '') input.value = value;
            }
            cell.appendChild(input);
            row.appendChild(cell);
        }
        this.tbody.appendChild(row);
        this.rowCount++;
        document.getElementById(focus_id).focus();
    }

    loadMoreRows(n_rows, read_only) {
        for (let i = 0; i < n_rows; i++) {
            this.createRow(read_only);

        }
    }

    handleKeyDown(e) {
        if ((e.key === 'Enter') && e.target.closest('tr').nextElementSibling === null)
        {
            this.loadMoreRows(1, this.readOnly);
        }
    }
}

function load_model()
{
    var model_hash = document.getElementById("model_hash").innerHTML;
    console.log(model_hash);
    if (model_hash!='None')
    {
        table1 = new SymbolTable('table-container-1', 0);
        table2 = new SymbolTable('table-container-2', 0, true);
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            // What to do when the response is ready
            data = JSON.parse(this.responseText);
            editor.setValue(data["code"]);
            var input_variables = data["input_vars"].split("\n");
            for (x in input_variables)
            {
                if (input_variables[x].length>0)
                {
                    v_name = input_variables[x].split('=')[0].replace("var","").trim();
                    v_value = input_variables[x].split('=')[1].replace(";","").trim();
                    table1.createRow(false,v_name, v_value);
                }
            }
            var output_variables = data["output_vars"].split("\n");
            for (y in output_variables)
            {
                console.log(output_variables[y]);
                if (output_variables[y].length>0)
                {
                    v_name = output_variables[y].split(';')[0].replace("var","").trim()
                    table2.createRow(true, v_name, '');
                }
            }
            run_code();
        }
        xhttp.open("GET", "get_data?model_hash="+model_hash, true);
        xhttp.send();
    }
    else {
        // Initialize tables
        table1 = new SymbolTable('table-container-1', 1);
        table2 = new SymbolTable('table-container-2', 1, true); // Different number of rows per load
    }
}

function submit_action(event) {
    event.preventDefault(); // Prevent the default form submission

    var input_variables = table1.getTableValues();
    var output_variables = table2.getTableValues();
    var code = editor.getValue();

    var post_data = {"inputs":input_variables, "outputs":output_variables, "code":code};

    var hiddenInputTestData = document.createElement('input');
    hiddenInputTestData.type = 'hidden';
    hiddenInputTestData.name = 'post_data';
    hiddenInputTestData.value = JSON.stringify(post_data);
        
    // Add the hidden inputs to the form
    var form = document.getElementById("form_ps")
    form.appendChild(hiddenInputTestData);
    // Submit the form
    form.submit();
}

function delete_last_row(container_id)
{
    const container = document.getElementById(container_id);
    
    // Find the table in the table-body div
    const tableBody = container.querySelector('.table-body table tbody');
    
    // Delete the last row if any rows exist
    if (tableBody.rows.length > 0) {
        tableBody.deleteRow(-1);
    }
 
}

// Create tables
var table1; 
var table2;

//init editor
var editor = ace.edit("editor");

//editor.setTheme("ace/theme/monokai");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");
load_model();

