import { Directive, HostListener, ChangeDetectorRef } from '@angular/core';
import { NavigationService } from './navigation.service';

@Directive({
    selector: '[tvqBackButton]',
})
export class BackButtonDirective {
    constructor(
        private navigation: NavigationService,
        private cdRef: ChangeDetectorRef) { }

    @HostListener('click')
    onClick(): void {
        this.navigation.back();
        this.forceRecalculateStyle();
        this.cdRef.detectChanges();
    }

    private forceRecalculateStyle(): number {
        return window.scrollY; // force reflow for animation
    }
}
