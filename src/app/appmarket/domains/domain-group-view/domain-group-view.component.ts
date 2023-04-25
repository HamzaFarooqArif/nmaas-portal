import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomainService} from '../../../service';
import {BaseComponent} from '../../../shared/common/basecomponent/base.component';
import {AuthService} from '../../../auth/auth.service';
import {ComponentMode, ModalComponent} from '../../../shared';
import {DomainGroup} from '../../../model/domaingroup';
import {Domain} from '../../../model/domain';

@Component({
  selector: 'app-domain-group-view',
  templateUrl: './domain-group-view.component.html',
  styleUrls: ['./domain-group-view.component.css']
})
export class DomainGroupViewComponent extends BaseComponent implements OnInit {

  public domainGroupId ;
  public domainGroup = new DomainGroup();
  public addingMode = false;
  public domains: Domain[] = [];
  public domainsToAdd = [];

  @ViewChild(ModalComponent, { static: true })
  public readonly modal: ModalComponent;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private domainService: DomainService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.refreshDomainForAdd();
    if (this.route.snapshot.data['mode'] === ComponentMode.CREATE) {
      console.warn("creation mode");
      this.addingMode = true;
    }
    this.route.params.subscribe(params => {
      if (params['id'] !== undefined) {
        this.domainGroupId = +params['id'];
        this.domainService.getDomainGroup(this.domainGroupId).subscribe(
            (domainGroup) => {
              this.domainGroup = domainGroup;
            },
            err => {
              console.error(err);
              if (err.statusCode && (err.statusCode === 404 ||
                  err.statusCode === 401 || err.statusCode === 403 || err.statusCode === 500)) {
                this.router.navigateByUrl('/notfound');
              }
            })
      } else {

      }
    })
  }

  submit() {
      console.log(this.domainGroup)
    // creation
    if(this.domainGroup.id === undefined || this.domainGroup.id === null) {
      this.domainService.createDomainGroup(this.domainGroup).subscribe( data => {
        console.warn("crated", data);
        this.router.navigate(['/admin/domains/groups/', data.id]);
      })
    } else {
      this.domainService.updateDomainGroup(this.domainGroup, this.domainGroupId).subscribe(_ => this.refresh());
    }
  }

  public deleteDomainFromGroup(domain: Domain) {
    this.domainService.deleteDomainFromGroup(this.domainGroup.id, domain.id).subscribe( _ => {
      this.refresh()
      this.refreshDomainForAdd()
    })
  }

  public refresh() {
    this.domainService.getDomainGroup(this.domainGroup.id).subscribe(data => this.domainGroup = data);
  }

  public showModal(): void {
    this.filterDomainInModal();
    this.modal.show();
  }

  public filterDomainInModal() {
    const domainIds = this.domainGroup.domains.map(val => val.id);
    this.domains = this.domains.filter(value => !domainIds.includes(value.id))
  }

  public closeModal(): void {
    const domainIds = this.domainsToAdd.map(val => val.id);
    this.domainService.addDomainsToGroup(this.domainGroup.codename, domainIds).subscribe(_ => {
      this.refresh();
      this.domainsToAdd = [];
      this.refreshDomainForAdd();
    });
    this.modal.hide();
  }

  public refreshDomainForAdd(): void {
    this.domainService.getAll().subscribe(domains => {
      this.domains = domains.filter(value => value.id !== this.domainService.getGlobalDomainId());
    });
  }

}
