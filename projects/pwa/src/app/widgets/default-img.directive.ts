import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: 'img[tvqDefault]',
})
export class DefaultImageDirective {
    constructor(private elem: ElementRef) {
    }

    @Input() default = 'assets/icons/apple-icon-180.png';

    @HostListener('error') onError(): void {
        console.log('error fetching image, using default');
        this.elem.nativeElement.src = this.default;
    }
}
