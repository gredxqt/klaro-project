import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeneficiaryComponent } from './features/beneficiary/beneficiary.component';
import { ManagerComponent } from './features/manager/manager.component';

const routes: Routes = [
  { path: '', redirectTo: 'beneficiary', pathMatch: 'full' },
  { path: 'beneficiary', component: BeneficiaryComponent },
  { path: 'manager', component: ManagerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}