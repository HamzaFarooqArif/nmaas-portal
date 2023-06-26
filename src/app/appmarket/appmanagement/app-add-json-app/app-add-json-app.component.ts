import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from '../../../shared';
import {AppsService} from '../../../service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-app-add-json-app',
    templateUrl: './app-add-json-app.component.html',
    styleUrls: ['./app-add-json-app.component.css']
})
export class AppAddJsonAppComponent implements OnInit {

    @ViewChild(ModalComponent, {static: true})
    public readonly modal: ModalComponent;

    public jsonText = '';
    public error = '';

    public JsonError = false;


    constructor(private readonly appsService: AppsService,
                private readonly router: Router) {
    }


    ngOnInit(): void {
    }

    onUpload(event: any) {
        console.log(event);
        const file = event.files[0];
        console.log(file);
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = () => {
            if (typeof fileReader.result === 'string') {
                try {
                    JSON.parse(fileReader.result);
                    this.appsService.createApplicationDTO(JSON.parse(fileReader.result)).subscribe(result => {
                            console.log('uploaded', result);
                            this.modal.hide();
                            this.router.navigate(['apps', result.id])
                        },
                        error => {
                            console.log(error)
                            if (error.message === null) {
                                this.JsonError = true;
                            } else {
                                this.error = error.message
                            }
                        })
                } catch (e) {
                    console.warn('invalid json')
                    this.JsonError = true;
                }
            }
        }
        fileReader.onerror = (error) => {
            console.log(error);
        }
    }

    public sendJsonText() {
        if (this.jsonText.length > 0) {
            try {
                JSON.parse(this.jsonText);
                this.appsService.createApplicationDTO(JSON.parse(this.jsonText)).subscribe(result => {
                        console.log('uploaded', result);
                        this.modal.hide();
                        this.router.navigate(['apps', result.id])
                    },
                    error => {
                        console.log(error)
                        if (error.message === null) {
                            this.JsonError = true;
                        } else {
                            this.error = error.message
                        }
                    })
            } catch (e) {
                console.warn('invalid json')
                this.JsonError = true;
            }
        }
    }

    public show() {
        this.modal.show();
    }


}
