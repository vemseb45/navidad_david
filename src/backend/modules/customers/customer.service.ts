import { CustomerRepository } from './customer.repository';

export class CustomerService {
  constructor(private readonly customerRepo = new CustomerRepository()) {}

  public async getOrCreateCustomer(data: { email: string; fullName: string; phone: string }) {
    return this.customerRepo.upsertByEmail(data);
  }

  public async getCustomerByEmail(email: string) {
    return this.customerRepo.getByEmail(email);
  }

  public async getCustomerDirectoryWithHistory() {
    return this.customerRepo.getAllCustomersWithPurchaseHistory();
  }
}
