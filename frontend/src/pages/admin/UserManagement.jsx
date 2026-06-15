// import AdminLayout from '../../layouts/AdminLayout';

// const users = [
//   { name: 'Alexander Vance', email: 'a.vance@corporation.com', role: 'Premium Client', status: 'Active', joined: 'Jan 2021', tier: 'Platinum', lastLogin: '2 hours ago' },
//   { name: 'Sarah Jenkins', email: 's.jenkins@finbridge.com', role: 'Senior Advisor', status: 'Active', joined: 'Mar 2019', tier: 'Staff', lastLogin: '15 min ago' },
//   { name: 'Michael Aris', email: 'm.aris@finbridge.com', role: 'Investment Advisor', status: 'Active', joined: 'Jun 2020', tier: 'Staff', lastLogin: '1 hour ago' },
//   { name: 'Priya Sharma', email: 'p.sharma@nextgen.com', role: 'Client', status: 'Onboarding', joined: 'Nov 2024', tier: 'Silver', lastLogin: 'Never' },
//   { name: 'James Harrington', email: 'j.harrington@harrington.com', role: 'Premium Client', status: 'Active', joined: 'Jan 2021', tier: 'Platinum', lastLogin: 'Yesterday' },
//   { name: 'Elena Rossi', email: 'e.rossi@finbridge.com', role: 'Loan Officer', status: 'Active', joined: 'Feb 2021', tier: 'Staff', lastLogin: '3 hours ago' },
//   { name: 'David Chen', email: 'd.chen@finbridge.com', role: 'Corporate Advisor', status: 'Active', joined: 'Sep 2020', tier: 'Staff', lastLogin: '30 min ago' },
//   { name: 'Emma Williams', email: 'e.williams@cornerstone.com', role: 'Client', status: 'Review', joined: 'Sep 2021', tier: 'Gold', lastLogin: '2 days ago' },
// ];

// const roleColors = {
//   'Premium Client': 'bg-accent/20 text-accent',
//   'Client': 'bg-surface-hover-high text-text-muted',
//   'Senior Advisor': 'bg-accent-fixed text-accent',
//   'Investment Advisor': 'bg-accent-fixed text-accent',
//   'Loan Officer': 'bg-accent-fixed text-accent',
//   'Corporate Advisor': 'bg-accent-fixed text-accent',
//   'Staff': 'bg-accent-fixed text-accent',
// };

// export default function UserManagement() {
//   return (
//     <AdminLayout>
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-headline-lg font-bold text-accent">User Management</h1>
//           <p className="text-body-md text-text-muted mt-1">Manage platform users, roles, and permissions.</p>
//         </div>
//         <button className="btn-primary flex items-center gap-2">
//           <span className="material-symbols-outlined">person_add</span>Add User
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
//         {[
//           { label: 'Total Users', value: '2,847', icon: 'people', color: 'text-accent bg-accent/10' },
//           { label: 'Active Now', value: '384', icon: 'wifi', color: 'text-success bg-success/10' },
//           { label: 'Advisors/Staff', value: '42', icon: 'badge', color: 'text-secondary bg-secondary/10' },
//           { label: 'Pending Review', value: '7', icon: 'pending', color: 'text-warning bg-warning/10' },
//         ].map((s, i) => (
//           <div key={i} className="card p-6 flex items-center gap-4">
//             <div className={`p-3 rounded-xl ${s.color.split(' ')[1]}`}>
//               <span className={`material-symbols-outlined ${s.color.split(' ')[0]}`}>{s.icon}</span>
//             </div>
//             <div>
//               <p className="text-text-muted text-label-lg">{s.label}</p>
//               <p className="text-headline-md font-bold text-accent">{s.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Users Table */}
//       <div className="card overflow-hidden">
//         <div className="px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <h2 className="text-headline-md font-bold text-accent">All Users</h2>
//           <div className="flex gap-3">
//             <div className="relative">
//               <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
//               <input className="pl-9 pr-4 py-2 rounded-lg border border-border text-body-sm bg-surface focus:outline-none focus:border-secondary" placeholder="Search users..." />
//             </div>
//             <select className="border border-border rounded-lg px-3 py-2 text-body-sm bg-surface text-text focus:outline-none">
//               <option>All Roles</option>
//               <option>Clients</option>
//               <option>Advisors</option>
//               <option>Staff</option>
//             </select>
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider">
//                 <th className="px-6 py-4 text-left">User</th>
//                 <th className="px-6 py-4 text-left">Role</th>
//                 <th className="px-6 py-4 text-left">Status</th>
//                 <th className="px-6 py-4 text-left">Joined</th>
//                 <th className="px-6 py-4 text-left">Last Login</th>
//                 <th className="px-6 py-4 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/50">
//               {users.map((user, i) => (
//                 <tr key={i} className="hover:bg-surface/50 transition-colors">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-accent-container flex items-center justify-center text-on-primary font-bold shrink-0">
//                         {user.name[0]}
//                       </div>
//                       <div>
//                         <p className="font-bold text-accent">{user.name}</p>
//                         <p className="text-xs text-text-muted">{user.email}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`status-badge ${roleColors[user.role] || 'bg-surface-hover-high text-text-muted'}`}>{user.role}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`status-badge ${user.status === 'Active' ? 'status-success' : user.status === 'Onboarding' ? 'status-info' : 'status-warning'}`}>{user.status}</span>
//                   </td>
//                   <td className="px-6 py-4 text-body-sm text-text">{user.joined}</td>
//                   <td className="px-6 py-4 text-body-sm text-text-muted">{user.lastLogin}</td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button className="text-secondary hover:text-accent transition-colors p-1" title="Edit"><span className="material-symbols-outlined text-base">edit</span></button>
//                       <button className="text-secondary hover:text-accent transition-colors p-1" title="Permissions"><span className="material-symbols-outlined text-base">admin_panel_settings</span></button>
//                       <button className="text-error hover:text-on-error transition-colors p-1" title="Deactivate"><span className="material-symbols-outlined text-base">block</span></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Pagination */}
//         <div className="px-8 py-5 border-t border-border flex items-center justify-between">
//           <p className="text-body-sm text-text-muted">Showing 8 of 2,847 users</p>
//           <div className="flex gap-2">
//             <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-surface transition-colors">
//               <span className="material-symbols-outlined text-sm">chevron_left</span>
//             </button>
//             {[1, 2, 3, '...', 142].map((p, i) => (
//               <button key={i} className={`w-9 h-9 rounded-lg border flex items-center justify-center text-label-lg font-bold transition-colors ${i === 0 ? 'bg-accent text-on-primary border-primary' : 'border-border text-text-muted hover:bg-surface'}`}>{p}</button>
//             ))}
//             <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-surface transition-colors">
//               <span className="material-symbols-outlined text-sm">chevron_right</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }


// Updated /home/workdir/FinBridge_Final/frontend/src/pages/admin/UserManagement.jsx
// src/pages/admin/UserManagement.jsx  (Updated)

// src/pages/admin/UserManagement.jsx

import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

const initialUsers = [
  { id: 1, name: 'Alexander Vance', email: 'a.vance@corporation.com', role: 'Premium Client', status: 'Active', joined: 'Jan 2021', lastLogin: '2 hours ago' },
  { id: 2, name: 'Sarah Jenkins', email: 's.jenkins@finbridge.com', role: 'Senior Advisor', status: 'Active', joined: 'Mar 2019', lastLogin: '15 min ago' },
  { id: 3, name: 'Michael Aris', email: 'm.aris@finbridge.com', role: 'Investment Advisor', status: 'Active', joined: 'Jun 2020', lastLogin: '1 hour ago' },
  { id: 4, name: 'Priya Sharma', email: 'p.sharma@nextgen.com', role: 'Client', status: 'Onboarding', joined: 'Nov 2024', lastLogin: 'Never' },
  { id: 5, name: 'James Harrington', email: 'j.harrington@harrington.com', role: 'Premium Client', status: 'Active', joined: 'Jan 2021', lastLogin: 'Yesterday' },
  { id: 6, name: 'Elena Rossi', email: 'e.rossi@finbridge.com', role: 'Loan Officer', status: 'Active', joined: 'Feb 2021', lastLogin: '3 hours ago' },
  { id: 7, name: 'David Chen', email: 'd.chen@finbridge.com', role: 'Corporate Advisor', status: 'Active', joined: 'Sep 2020', lastLogin: '30 min ago' },
  { id: 8, name: 'Emma Williams', email: 'e.williams@cornerstone.com', role: 'Client', status: 'Review', joined: 'Sep 2021', lastLogin: '2 days ago' },
];

const roleOptions = ['All Roles', 'Premium Client', 'Client', 'Senior Advisor', 'Investment Advisor', 'Loan Officer', 'Corporate Advisor'];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Client' });

  // ✅ Fixed: Properly define filteredUsers
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All Roles' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      alert("Name and Email are required");
      return;
    }
    const user = {
      id: Date.now(),
      ...newUser,
      status: 'Active',
      joined: 'Just now',
      lastLogin: 'Never'
    };
    setUsers([user, ...users]);
    setNewUser({ name: '', email: '', role: 'Client' });
    setShowAddModal(false);
    alert('User added successfully!');
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewUser({ name: user.name, email: user.email, role: user.role });
    setShowAddModal(true);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...newUser } : u));
      alert('User updated successfully!');
    }
    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'Client' });
    setShowAddModal(false);
  };

  const handleDeactivate = (id) => {
    if (confirm('Deactivate this user?')) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'Inactive' } : u));
      alert('User deactivated successfully');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-accent">User Management</h1>
          <p className="text-body-md text-text-muted">Manage platform users, roles, and access</p>
        </div>
        <button 
          onClick={() => { 
            setEditingUser(null); 
            setNewUser({ name: '', email: '', role: 'Client' }); 
            setShowAddModal(true); 
          }}
          className="btn-primary flex items-center gap-2"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-text-muted">search</span>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent"
            placeholder="Search by name or email..."
          />
        </div>
        <select 
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-3 border border-border rounded-2xl bg-surface text-text focus:outline-none"
        >
          {roleOptions.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="px-8 py-5 border-b border-border flex justify-between items-center">
          <h2 className="text-headline-md font-bold text-accent">All Users ({filteredUsers.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-surface text-label-lg text-text-muted uppercase tracking-wider border-b border-border">
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-left">Last Login</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-hover-high transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-accent">{user.name}</p>
                        <p className="text-sm text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="status-badge status-info">{user.role}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`status-badge ${user.status === 'Active' ? 'status-success' : 'status-warning'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-body-sm text-text-muted">{user.joined}</td>
                  <td className="px-6 py-5 text-body-sm text-text-muted">{user.lastLogin}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-secondary hover:text-accent transition-colors"
                        title="Edit User"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeactivate(user.id)}
                        className="text-error hover:text-red-600 transition-colors"
                        title="Deactivate"
                      >
                        <span className="material-symbols-outlined">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-surface rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-headline-md font-bold mb-6">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm mb-1.5">Full Name</label>
                <input 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full p-3 border border-border rounded-2xl bg-bg"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5">Email Address</label>
                <input 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-3 border border-border rounded-2xl bg-bg"
                  placeholder="john@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full p-3 border border-border rounded-2xl bg-bg"
                >
                  <option value="Client">Client</option>
                  <option value="Premium Client">Premium Client</option>
                  <option value="Senior Advisor">Senior Advisor</option>
                  <option value="Investment Advisor">Investment Advisor</option>
                  <option value="Loan Officer">Loan Officer</option>
                  <option value="Corporate Advisor">Corporate Advisor</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => { setShowAddModal(false); setEditingUser(null); }}
                className="flex-1 btn-ghost py-3"
              >
                Cancel
              </button>
              <button 
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="flex-1 btn-primary py-3"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}