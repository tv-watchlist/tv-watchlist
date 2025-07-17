import { Directive, HostListener, ChangeDetectorRef } from '@angular/core';
import { NavigationService } from '../services/navigation.service';

@Directive({
    selector: '[tvqBackButton]',
    standalone: false
})
export class BackButtonDirective {
    constructor(
        private navigation: NavigationService,
        private cdRef: ChangeDetectorRef) { }

    @HostListener('click')
    onClick(): void {
        this.navigation.back();
        this.cdRef.detectChanges();
    }
}
