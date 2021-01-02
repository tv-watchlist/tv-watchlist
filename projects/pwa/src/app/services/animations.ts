import { trigger, transition, style, query, animateChild, animate, group } from '@angular/animations';

const optional = { optional: true };

// https://fireship.io/lessons/angular-router-animations/
const slideXTo = (direction: string) => {
    // make sure parent or [@triggerName] element is relative
    // look for child which is toggled in dom and set initial style of absolute and direction 0.
    // on dom add (or :enter) set initial direction -100%
    // and on dom remove (or :leave) set direction 100% and new :enter to 0%
    return [
        query(':enter, :leave', [
            style({
                position: 'absolute',
                top: 0,
                [direction]: 0,
                width: '100%'
            })
        ], optional),
        query(':enter', [
            style({ [direction]: '-100%' })
        ], optional),
        group([
            query(':leave', [
                animate('400ms ease-in-out', style({ [direction]: '100%' }))
            ], optional),
            query(':enter', [
                animate('400ms ease-in-out', style({ [direction]: '0%' }))
            ], optional)
        ]),
        // Normalize the page style... Might not be necessary
        // Required only if you have child animations on the page
        query(':leave', animateChild(), optional),
        query(':enter', animateChild(), optional),
    ];
};

export const routerSliderStateLnR =
    trigger('routerSliderStateLnR', [
        transition('* => isLeft', slideXTo('left')),
        transition('* => isRight', slideXTo('right')),
        transition('isRight => *', slideXTo('left')),
        transition('isLeft => *', slideXTo('right')),
    ]);

export const routeSliderStatePlusMinus =
    trigger('routeSliderStatePlusMinus', [
        transition(':increment', slideXTo('right')),
        transition(':decrement', slideXTo('left'))
    ]);
