// Server-only file - this should only be imported in server contexts
// Using require() to avoid Turbopack bundling issues

let ioInstance: any = null;

// Type guard to check if we're on the server
const isServer = typeof window === 'undefined';

export function getSocketInstance() {
  if (!isServer) return null;
  return ioInstance;
}

export function setSocketInstance(io: any) {
  if (!isServer) return;
  ioInstance = io;
}

// Helper to emit notifications from API routes
export async function emitNotificationToUser(
  userId: string,
  notification: {
    title: string;
    message: string;
    type?: string;
    link?: string;
  }
) {
  if (!isServer) return;
  const io = getSocketInstance();
  if (io && typeof io.to === 'function') {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
  }
}

// Helper to broadcast to role
export async function broadcastToRole(
  role: string,
  event: string,
  data: any
) {
  if (!isServer) return;
  const io = getSocketInstance();
  if (io && typeof io.to === 'function') {
    io.to(`role:${role}`).emit(event, data);
  }
}

// Helper to emit appointment updates
export async function emitAppointmentUpdate(data: {
  appointmentId: string;
  status: string;
  patientId?: string;
  doctorId?: string;
}) {
  if (!isServer) return;
  const io = getSocketInstance();
  if (io && typeof io.to === 'function') {
    if (data.patientId) {
      io.to(`user:${data.patientId}`).emit('appointment_updated', data);
    }
    if (data.doctorId) {
      io.to(`user:${data.doctorId}`).emit('appointment_updated', data);
    }
    io.to('admin').emit('appointment_updated', data);
    // Emit schedule update to doctor
    if (data.doctorId) {
      io.to(`user:${data.doctorId}`).emit('schedule_updated', data);
    }
  }
}

// Helper to emit prescription updates
export async function emitPrescriptionUpdate(data: {
  prescriptionId: string;
  patientId?: string;
  doctorId?: string;
  action: 'created' | 'updated' | 'deleted';
}) {
  if (!isServer) return;
  const io = getSocketInstance();
  if (io && typeof io.to === 'function') {
    if (data.patientId) {
      io.to(`user:${data.patientId}`).emit('prescription_updated', data);
    }
    if (data.doctorId) {
      io.to(`user:${data.doctorId}`).emit('prescription_updated', data);
    }
    io.to('admin').emit('prescription_updated', data);
  }
}

// Helper to emit lab test updates
export async function emitLabTestUpdate(data: {
  labTestId: string;
  patientId?: string;
  action: 'created' | 'updated' | 'deleted';
}) {
  if (!isServer) return;
  const io = getSocketInstance();
  if (io && typeof io.to === 'function') {
    if (data.patientId) {
      io.to(`user:${data.patientId}`).emit('labtest_updated', data);
    }
    io.to('role:DOCTOR').emit('labtest_updated', data);
    io.to('admin').emit('labtest_updated', data);
  }
}

// Helper to emit billing updates
export async function emitBillingUpdate(data: {
  billId: string;
  patientId?: string;
  action: 'created' | 'updated' | 'deleted';
}) {
  if (!isServer) return;
  const io = getSocketInstance();
  if (io && typeof io.to === 'function') {
    if (data.patientId) {
      io.to(`user:${data.patientId}`).emit('billing_updated', data);
    }
    io.to('admin').emit('billing_updated', data);
  }
}
