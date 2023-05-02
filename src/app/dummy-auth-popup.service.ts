import { Injectable } from '@angular/core';
import { OpenIdConfiguration, PopupOptions } from 'angular-auth-oidc-client';
import { PopupResult } from 'angular-auth-oidc-client/lib/login/popup/popup-result';
import { Observable, of } from 'rxjs';

/** Custom dummy implementation of the PopUpService used to prevent this issue :
 *  https://github.com/damienbod/angular-auth-oidc-client/issues/1616.
 *  As the portal page opens our application with window.open(<our app url>, '_blank') without the 'noopener' option,
 *  we end-up with the portal window as opener of our window and the oidc lib thinks that we're in a popup.
 *  As we don't use popups in our auth process, the dummy implementation works for us.
 */
@Injectable({ providedIn: 'root' })
export class DummyAuthPopUpService {

  get result$(): Observable<PopupResult> {
    return of();
  }

  currentWindowIsPopUp(): boolean {
    return false;
  }

  isCurrentlyInPopup(config: OpenIdConfiguration): boolean {
    return false;
  }

  openPopUp(url: string, popupOptions: PopupOptions, config: OpenIdConfiguration): void {
    console.error('openPopUp() not implemented');
  }

  sendMessageToMainWindow(url: string): void {
    console.error('sendMessageToMainWindow() not implemented');
  }
}