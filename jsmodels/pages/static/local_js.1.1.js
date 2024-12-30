const tableId1 = 'table-container-1';
const tableId2 = 'table-container-2';
const errorModalId = 'modalIdError';

const tableContainerClass = '.row-5';
const tableRowSelectorClass = '.row';
const addRowsTemplateDiv = 'add_rows';
const calcRowsTemplateDiv = 'calc_rows';
const lineTemplateDiv = 'line_divider';
const actionsClassName = 'actions';

const calcPrecision = 4;
class SymbolTable {
    constructor(containerId, rowsOnCreate = 12, read_only = false, input_mode = 0, mhash = false) {
        this.container = document.getElementById(containerId);
        this.tableBody = this.container.querySelector(tableContainerClass);
        this.rowCount = 0;
        this.mode = input_mode;
        this.model_hash = mhash;
        this.table_id = containerId + "_table_";
        this.readOnly = read_only;
        this.loadMoreRows(rowsOnCreate, read_only);
        this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    clearTableValues()
    {
        const rows = this.tbody.querySelectorAll('.row');
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('.name-column');
            const name_element =  cells[0].querySelector('input');
            name_element.value="";
            var value_element = cells[1].querySelector('input');
            value_element.value="";
        });
    }

    getTableValues(mode=0)
    {
        var values="";
        var raw_names = [];
        var symbol_table={};
        // Get all rows in the table body
        const rows = this.tableBody.querySelectorAll('.row:not(.actions)');

        // Iterate through each row
        rows.forEach((row, index) => {
            console.log("row:", row);
        // Get all cells in the current row
            const cells = row.querySelectorAll('.name-column');

            const name_element =  cells[0].querySelector('input');
            var nameInput = name_element.value;
            var value_element = cells[1].querySelector('input');
            var valueInput = value_element.value;
            if (nameInput!="")  
            {
                raw_names.push(nameInput);
                if ((this.readOnly) && (this.mode == 1))
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

    createCommands()
    {
        const template = document.getElementById(addRowsTemplateDiv);
        const row = template.content.cloneNode(true);
        this.tableBody.appendChild(row);
    }

    deleteCommands() {
        let commands = this.tableBody.querySelectorAll('.actions');
        if (commands.length) {
            commands[0].remove();
        }
    }

    addLineDivider(){
        const template = document.getElementById(lineTemplateDiv);
        const row = template.content.cloneNode(true);
        this.tableBody.appendChild(row);
    }

    createRow(read_only, key='', value='') {
        this.deleteCommands();
        const template = document.getElementById(calcRowsTemplateDiv);
        const row = template.content.cloneNode(true);
        /**
         * 
        get template and clone
        iterate
        add label/key
        add value

        add new row 
        input for label
        input for value
         */
        var focus_id;
        for (let i = 0; i < 3; i++) {
            if ((i==0))
            {
                const name = row.querySelector('.name-column.label');
                const input = document.createElement('input');
                input.type = 'text';
                input.value = '';
                input.readOnly = (read_only)&&(i==this.mode);
                input.id = this.table_id + this.rowCount+"_name"
                input.className = 'inputName';
                focus_id = input.id;
                if (key!='') input.value = key;
                name.appendChild(input);
            }

            if (i==1) 
            {
                const name = row.querySelector('.name-column.value');
                const input = document.createElement('input');
                input.type = 'number';
                input.value = '';
                input.readOnly = (read_only)&&(i==this.mode);
                input.className = 'inputValue';
                input.id = this.table_id + this.rowCount+"_value"
                focus_id = input.id;
                if (key!='') input.value = key;
                name.appendChild(input);
                if (value != '') input.value = value;
            }
        }
        this.tableBody.appendChild(row);
        this.rowCount++;

        document.getElementById(focus_id).focus();
        this.addLineDivider();
        this.createCommands();
    }

    loadMoreRows(n_rows, keys = [], values = []) {
        for (let i = 0; i < n_rows; i++) {
            const key = keys[i] || '';
            const value = values[i] || '';
            this.createRow(key, value);
        }
    }

    handleKeyDown(e) {
    if (!this.model_hash)
        if ((e.key === 'Enter') && e.target.closest(tableContainerClass).nextElementSibling === null)
        {
            this.loadMoreRows(1, this.readOnly);
        }
    }

    deleteRow(element) {
        var row = element.closest(tableRowSelectorClass);
        var line_divider = row.nextElementSibling;
        line_divider.remove();
        row.remove();
        this.rowCount--;
    }

    deleteAllRows() {
        let allRows = this.tableBody.querySelectorAll(tableRowSelectorClass);
        console.log("all rows:", allRows);
        for(let i=0; i<allRows.length; i++) {
            if (!allRows[i].classList.contains(actionsClassName)) {
                let line_divider = allRows[i].nextElementSibling;
                line_divider.remove();
                allRows[i].remove();
            }
        }
        this.rowCount = 0;
    }
}

function run_code(){
    var code = editor.getValue();
    var input_variables = table1.getTableValues();
    var output_variables = table2.getTableValues();
    code = input_variables + output_variables + code;

    var initFunc = function(interpreter, globalObject) {

        var wrapper = function update_dom_outputs(p_name, p_value) {
            function isFloat(n) {
                return n === +n && n !== (n|0);
            }
            var dom_objects = table2.getTableValues(1);
            var table_id = dom_objects[p_name][0];
            var inputElement = document.getElementById(table_id);
            var precision = calcPrecision;
            if (isFloat(p_value)) 
            {
                if (Math.abs(p_value)>1e6)
                {
                    inputElement.value = Number.parseFloat(p_value).toExponential(precision);
                }
                else
                    inputElement.value = Number.parseFloat(p_value).toFixed(precision);
            }
            else
                inputElement.value = p_value;
        };
        interpreter.setProperty(globalObject, 'update_dom_outputs', interpreter.createNativeFunction(wrapper));
    };
    var outputs = table2.getTableValues(2);
    code = code + "\n";
    
    outputs.forEach(function(element){
        code = code + 'update_dom_outputs('+'"'+element+'"'+','+element+');\n';
    });

    //filter for unsupported features
    code = code.replaceAll("let ", "var ");
    try
    {
        document.getElementById("last_error").innerHTML='';
        var myInterpreter = new Interpreter(code, initFunc);   
        myInterpreter.run();
    }
    catch(err) { 
        document.getElementById("last_error").innerHTML=err;
        createModal(errorModalId);
    }
}

function unlock_model()
{
        //show controls
        document.querySelectorAll('.deleteOneRowButton').forEach(element => {
            element.style.visibility = "visible";
            element.style.display = "block";
        });
        document.getElementById('submit_share').style.visibility = "visible";
        document.getElementById('submit_share').style.display = "block";

        //add editable rows
        table1.model_hash = false;
        table2.model_hash = false;
        table1.readOnly = false;
        //enable input rows
        // Get the specific container's table body
        const tableBody = document.querySelector('.challenge-list .row-5');

        // Iterate through all rows
        Array.from(tableBody).forEach(row => {
            // Get all input elements in the current row
            const cells = row.getElementsByTagName('.name-column');
            const inputs = row.getElementsByTagName('input');
            //row.style.backgroundColor = 'white';

            // Skip the first input (readonly) and enable the second one
            if (inputs.length >= 2) {
                inputs[1].readOnly = false;  // Enable first input
                inputs[0].readOnly = false;  // Enable second input

                // Optionally, you can also modify other input attributes
                //cells[0].style.backgroundColor = 'white';  // Visual feedback
                //cells[1].style.backgroundColor = 'white';  // Visual feedback
            }
        });

        //hide the edit button
        toggleEditButtonVisible();
}

function toggleEditButtonVisible(show) {
    if (show) {
        document.getElementById('editing_on').style.display = "flex";
    } else {
        document.getElementById('editing_on').style.display = 'none';
    }
    
}

function load_model()
{
    var model_hash = document.getElementById("model_hash").innerHTML;
    //render as read-only
    if (model_hash!='None')
    {
        table1 = new SymbolTable(tableId1, 0, true, 0, true);
        table2 = new SymbolTable(tableId2, 0, true, 1, true);
        //hide controls
        document.querySelectorAll('.deleteOneRowButton').forEach(element => {
            element.style.display = 'none';
        });

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
                    table1.createRow(true,v_name, v_value);
                }
            }

            var output_variables = data["output_vars"].split("\n");
            for (y in output_variables)
            {
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
        table1 = new SymbolTable(tableId1, 1, false, 0, false);
        table2 = new SymbolTable(tableId2, 1, true, 1, false);
        // show edit button
        toggleEditButtonVisible(true);
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

function addRow(element){
    var table = element.closest("#"+tableId1);
    if (table) {
        table1.createRow();
    } else {
        table2.createRow();
    }
}

function deleteRow(element) {
    var table = element.closest("#"+tableId1);
    if (table) {
        table1.deleteRow(element);
    } else {
        table2.deleteRow(element);
    }
}

function deleteAllRows(element){
    var table = element.closest("#"+tableId1);
    if (table) {
        table1.deleteAllRows();
    } else {
        table2.deleteAllRows();
    }
}

function setFooterYear(footer_id) {
    const container = document.getElementById(footer_id);
    container.innerHTML = new Date().getFullYear();
}

function createModal(modalId) {
    const modal = document.getElementById(modalId);
    const closeBtn = modal.querySelector('.close');
    console.log("modal:", modal);
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
}

setFooterYear("copyright_date");
// Create tables
var table1; 
var table2;

//init editor
var editor = ace.edit("editor");

//editor.setTheme("ace/theme/monokai");
editor.setTheme("ace/theme/twilight");
editor.session.setMode("ace/mode/javascript");
load_model();
