function enumToString<T>(cls: Record<string, any>, enumValue: T) {
  for (const key of Object.keys(cls)) {
    const value = Reflect.get(cls, key)
    if (value === enumValue) return key
  }
  return '?'
}

export class AppointmentStatus {
  public static readonly None = 0
  public static readonly Pending = 1
  public static readonly Realized = 2
  public static readonly Canceled = 3

  public static toString(value: number) {
    return enumToString(AppointmentStatus, value)
  }
}

export class InvoiceStatus {
  public static readonly None = 0
  public static readonly Draft = 1
  public static readonly UnderReview = 2
  public static readonly Approved = 3
  public static readonly Finalized = 4
  public static readonly Sent = 5
  public static readonly Rejected = 6
  public static readonly Canceled = 7

  public static toString(value: number) {
    return enumToString(InvoiceStatus, value)
  }
}
