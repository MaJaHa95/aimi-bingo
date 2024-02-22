import { ResizeSensor } from "css-element-queries";
import { Observable } from "rxjs";
import "zone.js";

export interface ISize {
    width: number;
    height: number;
}

export const observeResizes = (elem: HTMLElement): Observable<ISize> => {
    return new ResizeSensorObservable(elem);
};

class ResizeSensorObservable extends Observable<ISize> {
    constructor(elem: HTMLElement) {
        super((subscriber) => {
            const zone = Zone.current;

            return Zone.root.run(() => {
                const sensor = new ResizeSensor(elem, (d) => {
                    zone.run(() => {
                        subscriber.next(d);
                    });
                });

                zone.run(() => {
                    subscriber.next({
                        width: elem.clientWidth,
                        height: elem.clientHeight
                    });
                });

                return () => {
                    sensor.detach();
                };
            });
        });
    }
}