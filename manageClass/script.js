var crudApp = new function () {
	this.myClass = [
		{ID: '1', Class_Name: '운영체제', Category: '전공필수', Credit: 3},
		{ID: '2', Class_Name: '컴퓨터구조론', Category: '전공선택', Credit: 4},
		{ID: '3', Class_Name: '심리학의 이해', Category: '교양필수', Credit: 2}
	];
	
	
	// select option
	this.category = ['전공필수', '전공선택', '교양필수', '교양선택'];
	// table header
	this.col = [];
	
	this.createTable = () => {
		for(var i = 0; i < this.myClass.length; i++) {
			for(var key in this.myClass[i]){
				if(this.col.indexOf(key) === -1){
					this.col.push(key);
				}
			}
		}
		
		var table = document.createElement('table');
		table.setAttribute('id', 'classTable');
		
		var tr = table.insertRow(-1);
		
		for(var h = 0; h < this.col.length; h++) {
			var th = document.createElement('th');
			th.innerHTML = this.col[h];
			tr.appendChild(th);
		}
		
		for (var i = 0; i < this.myClass.length; i++) {
			tr = table.insertRow(-1);
			for (var sub_i = 0; sub_i < this.col.length; sub_i++) {
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = this.myClass[i][this.col[sub_i]];
			}
			
			
			var td = document.createElement('td');
			tr.appendChild(td);
			var btnUpdate = document.createElement('input');
			btnUpdate.setAttribute('type', 'button');
			btnUpdate.setAttribute('value', 'Update');
			btnUpdate.setAttribute('id', 'Edit'+i);
			btnUpdate.setAttribute('style', 'background-color:#44CCEB');
			btnUpdate.setAttribute('onClick', 'crudApp.Update(this)');
			td.appendChild(btnUpdate);
			
			
			var btnSave = document.createElement('input');
			btnSave.setAttribute('type', 'button');
			btnSave.setAttribute('value', 'Save');
			btnSave.setAttribute('id', 'Save'+i);
			btnSave.setAttribute('style', 'display:none;background-color:#44CCEB');
			btnSave.setAttribute('onClick', 'crudApp.Save(this)');
			td.appendChild(btnSave);
			
			td = document.createElement('td');
			tr.appendChild(td);
			var btnDel = document.createElement('input');
			btnDel.setAttribute('type', 'button');
			btnDel.setAttribute('value', 'Delete');
			btnDel.setAttribute('id', 'Delete'+i);
			btnDel.setAttribute('style', 'background-color:#ED6542');
			btnDel.setAttribute('onClick', 'crudApp.Delete(this)');
			td.appendChild(btnDel);
		}
		
		tr = table.insertRow(-1);
		for (var j = 0; j < this.col.length; j++) {
			var newCell = tr.insertCell(-1);
			if (j == 2) {
				// 선택 항목 만들어주기
				var select = document.createElement("select");
				select.innerHTML = `<option valeu=""></option>`;
				for(var item = 0; item < this.category.length; item++) {
					select.innerHTML += `<option valeu="${this.category[item]}">${this.category[item]}</option>`;
				}
				newCell.appendChild(select);
			} else if (j > 0) {
				var tBox = document.createElement('input');
				tBox.setAttribute('type', 'text');
				tBox.setAttribute('value', '');
				newCell.appendChild(tBox);
			}
		}
		
		td = document.createElement('td');
		tr.appendChild(td);
		var btnCreate = document.createElement('input');
		btnCreate.setAttribute('type', 'button');
		btnCreate.setAttribute('value', 'Create');
		btnCreate.setAttribute('id', 'New');
		btnCreate.setAttribute('style', 'background-color:#207DD1');
		btnCreate.setAttribute('onClick', 'crudApp.CreateNew(this)');
		td.appendChild(btnCreate);
		
		
		var div = document.querySelector('#container');
		div.innerHTML = '수강관리 APP';
		div.appendChild(table);
	}
	
	this.Delete = (oButton) => {
		var targetIdx = oButton.parentNode.parentNode.rowIndex;
		this.myClass.splice(targetIdx-1, 1);
		this.createTable();
	}
	
	this.CreateNew = (oButton) => {
	//this.myClass = [
	//	{ID: '1', Class_Name: '운영체제', Category: '전공필수', Credit: 3},
		var writtenIdx = oButton.parentNode.parentNode.rowIndex;
		var trData = document.getElementById('classTable').rows[writtenIdx];
		
		var obj = {ID: (parseInt(this.myClass[this.myClass.length-1].ID) + 1).toString()
				  }
		
		for (var i = 1; i < this.col.length; i++) {
			var td = trData.getElementsByTagName('td')[i];
			if(td.childNodes[0].getAttribute('type') ==='text' || td.childNodes[0].tagName === 'SELECT') {
				var txtVal = td.childNodes[0].value;
				if (txtVal != '')  {
					obj[this.col[i]] = txtVal;
				} else {
					alert("모든 값을 입력해주세요.");
					return;
				}
			}
		}
		
		this.myClass.push(obj);
		this.createTable();
	}
	
	this.Update = (oButton) => {
		var writtenIdx = oButton.parentNode.parentNode.rowIndex;
		var trData = document.getElementById('classTable').rows[writtenIdx];
		
		for(var i = 1; i < this.col.length; i++)  {
			var td =  trData.getElementsByTagName('td')[i];
			
			if  (i === 2) {
				var select = document.createElement('select');
				
				for (var sub_i = 0; sub_i < this.category.length; sub_i++) {
					if  (this.category[sub_i] === td.innerText)
						select.innerHTML += `<option value="${this.category[sub_i]}" selected>${this.category[sub_i]}</option>`;
					else
						select.innerHTML += `<option value="${this.category[sub_i]}">${this.category[sub_i]}</option>`;
					
				}
				td.innerText = "";
				td.appendChild(select);
			} else {
				var input = document.createElement('input');
				input.setAttribute('type', 'text');
				input.setAttribute('value', td.innerText);
				
				td.innerText = "";
				td.appendChild(input);
			}
		}
		var save = document.getElementById('Save' + (writtenIdx-1));
		
		save.setAttribute('style', 'display:block;background-color:#44CCEB');
		oButton.setAttribute('style', 'display:None');
	}
	
	this.Save = (oButton) => {
		var writtenIdx = oButton.parentNode.parentNode.rowIndex;
		var trData = document.getElementById('classTable').rows[writtenIdx];
		
		
		for (var i = 1; i < this.col.length; i++) {
			var td  = trData.getElementsByTagName('td')[i];
			if(td.childNodes[0].getAttribute('type') ==='text' || td.childNodes[0].tagName === 'SELECT') {
				
				this.myClass[writtenIdx-1][this.col[i]] = td.childNodes[0].value;
			}
		}
		
		this.createTable();
	}
	
}

crudApp.createTable();


/*
var div = document.querySelector('#container');
div.innerHTML = '수강관리 APP';

div.appendChild(table);
*/