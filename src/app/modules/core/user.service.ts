import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserService implements CanActivate {
	userProfile: any;
	loggedIn: boolean;
	loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);
	expiresAt: number;
	constructor(private router: Router) {
		const lsProfile = localStorage.getItem('profile');
		this.expiresAt = JSON.parse(localStorage.getItem('expires_at'));
		if(this.tokenValid) {
			this.userProfile = JSON.parse(lsProfile);
			this.setLoggedIn(true);
		}else if(!this.tokenValid && lsProfile) {
			this.logout();
		}
	}
	setLoggedIn(value: boolean) {
		// Update login status subject
		this.loggedIn$.next(value);
		this.loggedIn = value;
	}
	private _setSession(authResult, profile) {
		// Save session data and update login status subject
		const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());
		// Set tokens and expiration in localStorage and props
		localStorage.setItem('access_token', authResult.accessToken);
		localStorage.setItem('id_token', authResult.idToken);
		localStorage.setItem('expires_at', expiresAt);
		localStorage.setItem('profile', JSON.stringify(profile));
		this.userProfile = profile;
		// Update login status in loggedIn$ stream
		this.setLoggedIn(true);
	}
	logout() {
		// Ensure all auth items removed from localStorage
		localStorage.removeItem('access_token');
		localStorage.removeItem('id_token');
		localStorage.removeItem('profile');
		localStorage.removeItem('expires_at');
		localStorage.removeItem('authRedirect');
		// Reset local properties, update loggedIn$ stream
		this.userProfile = undefined;
		this.setLoggedIn(false);
		// Return to homepage
		this.router.navigate(['/']);
	}
	get tokenValid(): boolean {
		// Check if current time is past access token's expiration
		return Date.now() < this.expiresAt;
	}
	canActivate() {
		return this.loggedIn$.asObservable().map(
			(loggedIn:boolean)=>{
				console.log('map called!');
				if(loggedIn){
					console.log('returning true!');
					return true;
				}
				else {
					console.log('navigating to login!');
					this.router.navigate(['/login']);
					console.log('returning false!');
					return false;
				}
			}
		);
			
	}

}
