import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};



@Injectable()
export class UserService {
    userName: any;
    constructor(private http: HttpClient) { }

    getUsers() {
        return this.http.get('http://localhost:3001/api/users');
    }
    setUserData(name){
        this.userName=name;
    }
    getUserData(){
        return this.userName;
    }
    register(data) {
        let body = JSON.stringify(data);
        return this.http.post('http://localhost:3001/api/register/', body, httpOptions);
    }
    saveUserHistory(data) {
        let body = JSON.stringify(data);
        return this.http.post('http://localhost:3001/api/save/', body, httpOptions);
    }
    getUserHistory(){
        return this.http.get('http://localhost:3001/api/getSaveHistory');
    }


    
}