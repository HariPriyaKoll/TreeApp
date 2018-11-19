import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { User } from '../models/users';
import { UserService } from '../services/user.service';



@Component({
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    currentUser: any;

    constructor(private userService: UserService) {
        //this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.loadUser();
    }

    private loadUser() {
        this.currentUser=this.userService.getUserData();
    }
}