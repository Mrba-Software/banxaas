import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PrimeNGConfig } from 'primeng/api';
import { Table } from 'primeng/table';
import { Customer, User } from 'src/app/parameters/customer';
import { CustomerService } from 'src/app/parameters/customerservice';
import { LocalStorageService } from 'src/app/parameters/local-storage.service';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {

  customers!: Customer[];

  selectedCustomers!: Customer[];

//   representatives!: Representative[];

  statuses!: any[];
  paiementMethode!: any[];
  range_quantity: any[] = [];
  range_amount: any[] = [];
  tabSeniority: User[] = [];
  seniority:any

  loading: boolean = true;
  disableButtonNext: boolean = false;
  disableButtonPrev: boolean = false;

  id: number = 1

  announceForm = new FormGroup({
    token: new FormControl(''),
    signature: new FormControl('')
  })

  @ViewChild('dt') table!: Table;

  constructor(
    private customerService: CustomerService, 
    private primengConfig: PrimeNGConfig,
    private localStorage:LocalStorageService
    ) { }

  ngOnInit(): void {
    this.range_quantity = [];
    this.range_amount = [];
    this.tabSeniority = [];
    const datauser: any = this.localStorage.get('data');
    const data = JSON.parse(datauser);
    const dataForm = this.announceForm.value;
    dataForm.token = data.token;
    dataForm.signature = data.signature;
    
    this.customerService.getAds(dataForm, this.id).subscribe(
        response => {
            this.customers = response;
            response.forEach((element: any) => {
                this.seniority = element.user.seniority;
                this.tabSeniority.push(this.seniority)
                if (element.quantityType==="R") {
                    this.range_quantity.push([Number(element.quantityMin),Number(element.quantityMax)])
                }else {
                    this.range_quantity.push([Number((element.quantityFixe))])
                } 
                if (element.amountType==="R") {
                    this.range_amount.push([Number(element.amountMin),Number(element.amountMax)])
                }else {
                    this.range_amount.push([Number(element.amountFixe)])
                } 
                
            });
            
            this.loading = false;

            
        }
    )

    // this.customerService.getCustomersLarge().then((customers: Customer[]) => {
    //     this.customers = customers;
    //     this.customers.forEach(element => {
    //     if (element.quantite_type==="range") {
    //         this.range_quantity.push([element.quantite_min,element.quantite_max])
    //     }else {
    //         this.range_quantity.push([element.quantite_fixe])
    //     } 
    //     if (element.montant_type==="range") {
    //         this.range_amount.push([element.montant_min,element.montant_max])
    //     }else {
    //         this.range_amount.push([element.montant_fixe])
    //     } 
        
    // });
        
    //     this.loading = false;
    // });
    
    this.paiementMethode = [
        {name: "Orange", value: 'orange'},
        {name: "Wave", value: 'wave'},
        {name: "Free", value: 'free'}
    ];

    this.statuses = [
        {label: 'Vente', value: 'V'},
        {label: 'Achat', value: 'A'}
    ]
    this.primengConfig.ripple = true;
  }

  filtreRangeQuantity(event: { target: any; }){

    let quantite = event.target.value;
    quantite = Number(quantite)  
     console.log(this.range_quantity);
      
    this.range_quantity.forEach(element => {
        console.log(element.length);
        
        switch (element.length) {

            case 2:
                
                if (element[0]<=quantite && quantite<=element[1]) {
                    
                    this.table.filter(quantite, 'quantityMin', 'lte');
                    this.table.filter(quantite, 'quantityMax', 'gte');
                }
                break;
        
            default:

                break;
        }

        
        
    });

  }

  filtreFixeQuantity(event: { target: any; }){

    let quantite = event.target.value;
    quantite = Number(quantite)  
     console.log(this.range_quantity);
      
    this.range_quantity.forEach(element => {
        console.log(element.length);
        
        switch (element.length) {

            case 1:
                
                if (element[0] === quantite ) {
                    
                    this.table.filter(quantite, 'quantityFixe', 'equals');
                }
                break;
        
            default:

                break;
        }

        
        
    });

  }

  
  filtreRangeAmount(event: { target: any; }){

    let amount = event.target.value;
    amount = Number(amount)  
      
    this.range_amount.forEach(element => {
        console.log(element.length);
        
        switch (element.length) {

            case 2:
                
                if (element[0]<=amount && amount<=element[1]) {
                    
                    this.table.filter(amount, 'amountMin', 'lte');
                    this.table.filter(amount, 'amountMax', 'gte');
                }
                break;
        
            default:

                break;
        }

        
        
    });

  }

  filtreFixeAmount(event: { target: any; }){

    let amount = event.target.value;
    amount = Number(amount)  
     console.log(this.range_amount);
      
    this.range_amount.forEach(element => {
        console.log(element.length);
        
        switch (element.length) {

            case 1:
                
                if (element[0] === amount ) {
                    
                    this.table.filter(amount, 'amountFixe', 'equals');
                }
                break;
        
            default:

                break;
        }

        
        
    });

  }

  filtreSeniority(event: { target: any; }){
    let senior = event.target.value;
    console.log(this.tabSeniority);
    
    this.tabSeniority.forEach(element => {
        if (senior != element) {
            console.log(element);
            
            this.table.filter(senior, 'user.seniority', 'startsWith');
            
        }
    })

  }

  
//   onActivityChange(event: { target: any; }) {
//     const value = event.target.value;
//     if (value && value.trim().length) {
//         const activity = parseInt(value);
        

//         if (!isNaN(activity)) {
//             this.table.filter(activity, 'marge', 'gte');
//         }
//     }
// }

// onDateSelect(value: any) {
//     this.table.filter(this.formatDate(value), 'date', 'equals')
// }

// formatDate(date: { getMonth: () => number; getDate: () => any; getFullYear: () => string; }) {
//     let month = date.getMonth() + 1;
//     let day = date.getDate();

//     if (month < 10) {
//         month = 0 + month;
//     }

//     if (day < 10) {
//         day = 0 + day;
//     }

//     return date.getFullYear() + '-' + month + '-' + day;
// }

// onRepresentativeChange(event: { value: any; }) {
//     this.table.filter(event.value, 'sens', 'in')
// }

    listAnnonce(id:number){
        const datauser: any = this.localStorage.get('data');
        const data = JSON.parse(datauser);
        const dataForm = this.announceForm.value;
        this.customerService.getAds(dataForm, id).subscribe(
            response => {
                this.customers = response;
                
            response.forEach((element: any) => {
                
                if (element.user.seniority < 86400) {
                    this.seniority = 'Aujourd\'hui'
                }
                else {
                    this.seniority = Math.trunc(element.user.seniority / 86400) + ' jour(s)'
    
                }

                if (element.quantityType==="R") {
                    this.range_quantity.push([Number(element.quantityMin),Number(element.quantityMax)])
                }else {
                    this.range_quantity.push([Number(element.quantityFixe)])
                } 
                if (element.amountType==="R") {
                    this.range_amount.push([Number(element.amountMin),Number(element.amountMax)])
                }else {
                    this.range_amount.push([Number(element.amountMixe)])
                } 
                
            });
            
            this.loading = false;
                
            }
        )
    }
    reset(){
        this.id = 1;
        this.listAnnonce(this.id);
    }
    next(){
        if (this.id >= 1) {
            this.id = this.id + 1
            this.listAnnonce(this.id)
            this.disableButtonNext = false
            this.disableButtonPrev = false
            if (this.customers.length != 10) {
                
                this.disableButtonNext = true
            }
        } 
        else {
            this.disableButtonNext = true
            this.disableButtonPrev = false
        }
    }
    prev(){
        if (this.id >= 2) {
            this.disableButtonPrev = false
            this.disableButtonNext = false
            this.id = this.id - 1;
            this.listAnnonce(this.id)

        }
        else {
            this.disableButtonPrev = true
            this.disableButtonNext = false
        }
    }
}
