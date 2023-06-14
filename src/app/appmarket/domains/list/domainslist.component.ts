import {AuthService} from '../../../auth/auth.service';
import {Domain} from '../../../model/domain';
import {Role} from '../../../model/userrole';
import {DomainService} from '../../../service/domain.service';
import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {SortableHeaderDirective, SortColumn, SortDirection} from '../../../service/sort-domain.directive';


export interface SortEvent {
    column: SortColumn;
    direction: SortDirection;
}

@Component({
    selector: 'app-domains-list',
    templateUrl: './domainslist.component.html',
    styleUrls: ['./domainslist.component.css']
})
export class DomainsListComponent implements OnInit {

    public domains: Observable<Domain[]>;

    public searchValue = '';
    p: number;

    @ViewChildren(SortableHeaderDirective)
    headers: QueryList<SortableHeaderDirective>;

    constructor(protected domainService: DomainService, protected authService: AuthService, public translate: TranslateService) {
    }

    ngOnInit() {
        this.update();
    }

    protected getDomainsObservable(): Observable<Domain[]> {
        if (this.authService.hasRole(Role[Role.ROLE_SYSTEM_ADMIN]) || this.authService.hasRole(Role[Role.ROLE_OPERATOR])) {
            return this.domainService.getAll().pipe(
                map((domains) => domains.filter((domain) => domain.id !== this.domainService.getGlobalDomainId())));
        } else {
            return this.domainService.getMyDomains().pipe(
                map((domains) => domains.filter((domain) => this.authService.hasDomainRole(domain.id, Role[Role.ROLE_DOMAIN_ADMIN]))));
        }
    }

    protected update(): void {
        this.domains = this.getDomainsObservable().pipe(
            map((domains) => [...domains].sort(
                (a, b) => {
                    if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                    }
                    if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                    }
                    return 0;
                }
                )
            )
        )
    }

    public changeState(domain: Domain): void {
        this.domainService.updateDomainState(domain).subscribe(() => this.update());
        this.domainService.setUpdateRequiredFlag(true);
    }

    public getStateLabel(active: boolean): string {
        return active ? this.translate.instant('DOMAINS.DISABLE_BUTTON') : this.translate.instant('DOMAINS.ENABLE_BUTTON');
    }

    onSort({ column, direction }: SortEvent) {
        // resetting other headers
        this.headers.forEach((header) => {
            if (header.sortable !== column) {
                header.direction = '';
            }
            console.warn(header)
        });
        console.log(this.headers)

        console.log(column, direction);
        this.domains = this.domains.pipe(map(value => value.sort((a, b) => {
           if (direction === 'asc') {
               if (a[column] > b[column]) {
                   return 1;
               }

               if (a[column] < b[column]) {
                   return -1;
               }
               return 0;
           } else {
               if (a[column] > b[column]) {
                   return -1;
               }

               if (a[column] < b[column]) {
                   return 1;
               }
               return 0;
           }
        } )))
        this.domains.subscribe(value => console.warn(value))
    }

    public getSort(column: string) {
        let header;
        if (this.headers !== undefined) {
            this.headers.forEach(h => {
                if (h.sortable === column) header = h;
            })
            return header.direction;
        } else {
            return ''
        }
    }


}
