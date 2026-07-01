/**
 * Barrel de compatibilidad — preferir imports directos por dominio.
 */
export {
  getAllProfiles,
  getAllCustomers,
  getAllSellers,
  setProfileActive,
  updateProfileRole as updateUserRole,
  updateProfile,
  getCustomerIdByProfileId,
  getSellerIdByProfileId,
  getSellerAvailability,
  updateSellerAvailability,
} from './profileService';

export { getRoles } from './roleService';
export { getSupportTickets } from './ticketService';
