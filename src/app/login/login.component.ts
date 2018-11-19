import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService } from '../services/alert.service';
import { UserService } from '../services/user.service';



@Component({templateUrl: 'login.component.html',
styleUrls: [
    './login.component.css'
  ]})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    users: any;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService,
        private userService: UserService) {}

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        // this.authenticationService.login(this.f.username.value, this.f.password.value)
        //     .pipe(first())
        //     .subscribe(
        //         data => {
        //             this.router.navigate([this.returnUrl]);
        //         },
        //         error => {
        //             this.alertService.error(error);
        //             this.loading = false;
        //         });
        this.userService.getUsers().subscribe(
            data => { 
             this.users = data;
             let found=false;
             this.users.forEach(element => {
                 if(element.name==this.f.username.value && element.password== this.f.password.value){
                    found=true;
                    this.userService.setUserData(this.f.username.value);
                    this.router.navigate(['/home']);
                 }
             });
             if(!found){
                this.alertService.error("Not a registered User or please verify credentials");
                this.loading = false;
             }
            },
            err => {
                console.log(err);
            },      
            () => console.log('User Logged in')
            );
    }
}
