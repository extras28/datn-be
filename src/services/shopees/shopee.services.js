import axios from "axios";
import { getCurrentTimestamp } from "../../shared/utils/utils";
import { getAccessTokenTemp, getSign, shopAuth } from "./shopee.helper";

const partnerId = 1004018;

let Cookie =
  "_gcl_au=1.1.926871963.1702448836; _fbp=fb.1.1702448836737.733895414; SPC_F=z6kOODg5sI1j98wKW5KeC22oYtUGGLQl; REC_T_ID=a94bcc1e-9980-11ee-ace7-eea109377c81; _ga_M32T05RVZT=GS1.1.1702448848.1.1.1702448976.60.0.0; SPC_CLIENTID=ejZrT09EZzVzSTFqkythhccjttdleugd; _hjSessionUser_868286=eyJpZCI6ImM3MmRkN2Q4LTYwNDQtNWZhOC04MGE3LWQ4NzY3NDBmMGRjOSIsImNyZWF0ZWQiOjE3MDI0NDg4NjI2NDYsImV4aXN0aW5nIjp0cnVlfQ==; _ga_QLZF8ZGF0S=GS1.1.1708930868.1.1.1708930976.0.0.0; _med=refer; SPC_CDS=e9ca9108-17b3-4c7a-9485-4b14d2024c72; SPC_SC_SA_TK=; SPC_SC_SA_UD=; SC_DFP=bVQPSZHbmsZJoOuWFFApFRQnWrUspJzj; fulfillment-language=vi; SPC_EC=.V2gyRlZTQ0FnSGpDajRRU7cM2eNtz2P13IN1vN2UGPOBLbhWZVYFIq0oapLt1x/RPy0J19+e3WV7Zu+5LCPeXTQFJhpyIIzT8H01s3CzcjPghL9htfegQfX7a4NiP+D96Fd9czW3pOgo2pe7O1osE0yak7ju5ITfN8uye5224A0X4hT9cG8sdnI7gRzRIyawb2sF/SXp4PQEhgVmVxDAkA==; SPC_ST=.V2gyRlZTQ0FnSGpDajRRU7cM2eNtz2P13IN1vN2UGPOBLbhWZVYFIq0oapLt1x/RPy0J19+e3WV7Zu+5LCPeXTQFJhpyIIzT8H01s3CzcjPghL9htfegQfX7a4NiP+D96Fd9czW3pOgo2pe7O1osE0yak7ju5ITfN8uye5224A0X4hT9cG8sdnI7gRzRIyawb2sF/SXp4PQEhgVmVxDAkA==; SPC_SC_TK=24afb450e5162e0da77fbcda025f936d; SPC_SC_UD=1180611297; SPC_STK=KDOBKvD4/cDpfzFjSTjqgdR5Au8E3BlQKSZnj6LDx2NW/q03NMAFXwXn4TTbqh8InBEsbkKAv9VhzxiUCmJkROFdmCj1e7XsWHzF5AFFA3+P7DySpNyAPt95BlajxxVOJ9VhWC2iONzow7ycq3iUki2PtlNNA0YlBH0aSZxtaJKmq+15p8tMlGS2X7keHlcP; SPC_U=1180611297; SPC_R_T_IV=NmVnbFoxb1NZUkMxQWYwYQ==; SPC_T_ID=FC3fdWTKWNvOPiGq1Pf5yddwN7vrzZM35qvJLIjv/uQDJiv33ChKApwe2U2oarMn1X3b9i4gVQMFHKIplMId/J7G0DY4267/fMhveHMxWMYKpvHNiIegTDFR5QwHUdbTpp8FDyFZNjcO9dGlD9gvsVU8oG3nScEHgn5Twb6GTGg=; SPC_T_IV=NmVnbFoxb1NZUkMxQWYwYQ==; SPC_R_T_ID=FC3fdWTKWNvOPiGq1Pf5yddwN7vrzZM35qvJLIjv/uQDJiv33ChKApwe2U2oarMn1X3b9i4gVQMFHKIplMId/J7G0DY4267/fMhveHMxWMYKpvHNiIegTDFR5QwHUdbTpp8FDyFZNjcO9dGlD9gvsVU8oG3nScEHgn5Twb6GTGg=; _gid=GA1.2.725361454.1709536176; _ga_PN56VNNPQX=GS1.2.1709536176.6.1.1709536176.0.0.0; _ga_CGXK257VSB=GS1.1.1709536175.6.0.1709536190.45.0.0; _QPWSDCXHZQA=34fcc9d5-c2ee-4080-de96-24739aa5d892; REC7iLP4Q=0fd94f4b-62ac-41d7-99ce-4cb7d631ea5a; SPC_SI=UnvEZQAAAAB0YjRvdjJZaO/QCAAAAAAAdWJlcU03Y3o=; SPC_SEC_SI=v1-ekdiZlN5UEVaZlNwZUljVmlpso+7LRdvTh775icGNjJojRBnMbo4lXE3EBerv0ayxPgY14Yov2GIn2G1EqMFt3x02TQTFAPJNtocUw3+vak=; _ga_3XVGTY3603=GS1.1.1709538880.5.1.1709538943.60.0.0; _med=refer; _ga=GA1.1.663783647.1702448849; shopee_webUnique_ccd=hGGG2qutub0%2BsQMuHkQ0ew%3D%3D%7CC%2BxfLq8%2BsfsMDyrEXRev8KEYCA4sK8F7TPu8VdrVMRfIEqaL7YHmOMrIoaOrXZnPQE8rrGNUI8o47g%3D%3D%7CYEVeemCALsuf0ZFi%7C08%7C3; ds=e03d01c8739e4fbc8d434e76cb44386a; AMP_TOKEN=%24RETRIEVING; _ga_4GPP1ZXG63=GS1.1.1709541070.5.1.1709541794.60.0.0; CTOKEN=Pdo66doDEe6FOA6YKiY7%2FA%3D%3D";

let SPC_CDS = "e9ca9108-17b3-4c7a-9485-4b14d2024c72";
let baseUrl = "https://banhang.shopee.vn/api/v3";

export async function getShipmentListV2() {
  try {
    const path = "/api/v2/order/get_shipment_list";
    const sign = getSign({ partnerId: partnerId, path: path });
    const tokens = getAccessTokenTemp();
    let timestamp = getCurrentTimestamp();
  } catch (error) {
    console.log(error.message);
  }
}

// V3
export async function getListOrderIdV3({
  page = 1,
  limit = 40,
  sortBy = "create_date_desc",
}) {
  const config = {
    headers: {
      Cookie: Cookie,
    },
    params: {
      SPC_CDS: SPC_CDS,
      SPC_CDS_VER: 2,
      page_size: limit,
      page_number: page,
      from_page_number: 1,
      total: 0,
      flip_direction: "ahead",
      page_sentinel: "0,0",
      sort_by: sortBy,
      backend_offset: "",
    },
  };

  try {
    const response = await axios.get(
      `${baseUrl}/order/get_order_id_list`,
      config
    );
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getDetailOrderV3(orderId) {
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${baseUrl}/order/get_one_order`,
    headers: {
      Cookie: Cookie,
    },
    params: {
      SPC_CDS: SPC_CDS,
      SPC_CDS_VER: 2,
      order_id: orderId,
    },
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function getPackageV3(orderId) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${baseUrl}/order/get_package`,
    headers: {
      Cookie: Cookie,
    },
    params: {
      SPC_CDS: SPC_CDS,
      SPC_CDS_VER: 2,
      order_id: orderId,
    },
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}
