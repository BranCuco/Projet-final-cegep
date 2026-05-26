'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CurrentUserProfile,
  ShippingAddress,
  UpsertShippingAddressRequest,
  createShippingAddress,
  deleteShippingAddress,
  getCurrentUserProfile,
  getShippingAddresses,
  isAuthenticated,
  logoutAccount,
  updateCurrentUserProfile,
  updateShippingAddress,
} from '@/lib/api';
import './account.scss';

const emptyProfile: CurrentUserProfile = {
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  roles: [],
};

const emptyAddress: UpsertShippingAddressRequest = {
  label: '',
  recipientName: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CurrentUserProfile>(emptyProfile);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [addressForm, setAddressForm] = useState<UpsertShippingAddressRequest>(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const loadProfile = async () => {
      const [profileData, addressesData] = await Promise.all([getCurrentUserProfile(), getShippingAddresses()]);
      if (profileData) {
        setProfile(profileData);
      }
      setAddresses(addressesData);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleChange = (field: keyof CurrentUserProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAddressChange = (field: keyof UpsertShippingAddressRequest, value: string | boolean) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileSubmit = async () => {
    setSaving(true);
    setMessage('');

    const result = await updateCurrentUserProfile(profile);
    if (!result) {
      setMessage('Impossible de mettre à jour le profil.');
      setSaving(false);
      return;
    }

    setProfile(result);
    setMessage('Profil mis à jour avec succès.');
    setSaving(false);
  };

  const reloadAddresses = async () => {
    const data = await getShippingAddresses();
    setAddresses(data);
  };

  const handleAddressSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const result = editingAddressId
      ? await updateShippingAddress(editingAddressId, addressForm)
      : await createShippingAddress(addressForm);

    if (!result) {
      setMessage('Impossible de sauvegarder l\'adresse.');
      setSaving(false);
      return;
    }

    await reloadAddresses();
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
    setMessage('Adresse enregistrée avec succès.');
    setSaving(false);
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
  };

  const handleDeleteAddress = async (id: number) => {
    const confirmed = window.confirm('Supprimer cette adresse de livraison ?');
    if (!confirmed) {
      return;
    }

    const deleted = await deleteShippingAddress(id);
    if (!deleted) {
      setMessage('Impossible de supprimer l\'adresse.');
      return;
    }

    if (editingAddressId === id) {
      setEditingAddressId(null);
      setAddressForm(emptyAddress);
    }

    await reloadAddresses();
    setMessage('Adresse supprimée.');
  };

  const handleSetDefaultAddress = async (address: ShippingAddress) => {
    const result = await updateShippingAddress(address.id, {
      label: address.label,
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: true,
    });

    if (!result) {
      setMessage('Impossible de définir cette adresse comme principale.');
      return;
    }

    await reloadAddresses();
    setMessage('Adresse principale mise à jour.');
  };

  const handleLogout = () => {
    logoutAccount();
    router.push('/login');
  };

  if (loading) {
    return <div className="account-page"><div className="container"><div className="account-loading">Chargement...</div></div></div>;
  }

  return (
    <div className="account-page">
      <section className="account-hero">
        <div className="container">
          <h1>Mon compte</h1>
          <p>Consultez et modifiez vos informations personnelles et de livraison</p>
        </div>
      </section>

      <section className="account-content container">
        <div className="account-grid">
          <div className="account-card">
            <h2>Informations générales</h2>
            <div className="field-grid">
              <label>
                Courriel
                <input value={profile.email} onChange={(e) => handleChange('email', e.target.value)} />
              </label>
              <label>
                Téléphone
                <input value={profile.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} />
              </label>
              <label>
                Prénom
                <input value={profile.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
              </label>
              <label>
                Nom
                <input value={profile.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
              </label>
            </div>
          </div>

          <div className="account-card">
            <h2>Adresses de livraison</h2>

            {addresses.length === 0 ? (
              <p className="address-empty">Aucune adresse enregistrée. Ajoutez-en une pour finaliser vos achats.</p>
            ) : (
              <div className="addresses-list">
                {addresses.map((address) => (
                  <article key={address.id} className={`address-item ${address.isDefault ? 'default' : ''}`}>
                    <div className="address-content">
                      <h3>
                        {address.label || 'Adresse'}
                        {address.isDefault && <span className="badge-default">Principale</span>}
                      </h3>
                      <p>{address.recipientName}</p>
                      <p>{address.phoneNumber}</p>
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                    <div className="address-actions">
                      {!address.isDefault && (
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleSetDefaultAddress(address)}>
                          Définir principale
                        </button>
                      )}
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEditAddress(address)}>
                        Modifier
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteAddress(address.id)}>
                        Supprimer
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <form className="address-form" onSubmit={handleAddressSubmit}>
              <h3>{editingAddressId ? 'Modifier l\'adresse' : 'Ajouter une adresse'}</h3>
              <div className="field-grid">
                <label>
                  Étiquette
                  <input value={addressForm.label} onChange={(e) => handleAddressChange('label', e.target.value)} placeholder="Maison, Travail..." />
                </label>
                <label>
                  Nom du destinataire
                  <input value={addressForm.recipientName} onChange={(e) => handleAddressChange('recipientName', e.target.value)} required />
                </label>
                <label>
                  Téléphone
                  <input value={addressForm.phoneNumber} onChange={(e) => handleAddressChange('phoneNumber', e.target.value)} />
                </label>
                <label className="full-width">
                  Adresse 1
                  <input value={addressForm.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required />
                </label>
                <label className="full-width">
                  Adresse 2
                  <input value={addressForm.addressLine2} onChange={(e) => handleAddressChange('addressLine2', e.target.value)} />
                </label>
                <label>
                  Ville
                  <input value={addressForm.city} onChange={(e) => handleAddressChange('city', e.target.value)} required />
                </label>
                <label>
                  Province/État
                  <input value={addressForm.state} onChange={(e) => handleAddressChange('state', e.target.value)} />
                </label>
                <label>
                  Code postal
                  <input value={addressForm.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} required />
                </label>
                <label>
                  Pays
                  <input value={addressForm.country} onChange={(e) => handleAddressChange('country', e.target.value)} required />
                </label>
                <label className="checkbox-label full-width">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => handleAddressChange('isDefault', e.target.checked)}
                  />
                  Définir comme adresse principale
                </label>
              </div>
              <div className="address-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : editingAddressId ? 'Mettre à jour l\'adresse' : 'Ajouter l\'adresse'}
                </button>
                {editingAddressId && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm(emptyAddress);
                    }}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="account-card actions-card">
            {message && <div className="alert alert-info">{message}</div>}
            <div className="actions-row">
              <button type="button" className="btn btn-primary" onClick={handleProfileSubmit} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => router.push('/boutique')}>
                Retour à la boutique
              </button>
              <button type="button" className="btn btn-danger" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
            {profile.roles.includes('Admin') && (
              <div className="admin-callout">
                <p>Vous êtes administrateur.</p>
                <button type="button" className="btn btn-secondary" onClick={() => router.push('/admin/products')}>
                  Aller au panneau admin
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}