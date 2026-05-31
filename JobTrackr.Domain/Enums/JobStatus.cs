using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Domain.Enums
{
    public enum JobStatus
    {
        Applied,        // Başvuruldu
        InReview,       // İnceleniyor
        Interview,      // Mülakat aşaması
        TechnicalTest,  // Teknik test
        Offer,          // Teklif geldi
        Rejected,       // Reddedildi
        Withdrawn       // Başvuru geri çekildi
    }
}
