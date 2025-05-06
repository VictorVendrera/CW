const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
  },
  chargeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chargeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chargeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  chargeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066FF',
  },
  chargeInfo: {
    marginBottom: 8,
  },
  chargeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  chargeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  statusPaid: {
    color: '#34C759',
  },
  statusPending: {
    color: '#FF9500',
  },
  statusOverdue: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
  },
}); 