import { defineConfig, wrapFieldsWithMeta } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch: "main",
  clientId: 'b6b0cb5c-4b1b-43f4-9bea-8d6867c09320', // Get this from tina.io
  token: '254536a0c4512bf1e0adf225316fc90066f93573', // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "./",
  },
  media: {
    tina: {
      mediaRoot: "assets/images",
      publicFolder: "./",
    },
  },
  schema: {
    collections: [
      {
        name: "posts",
        label: "مطالب",
        path: "_posts",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "عنوان",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "subtitle",
            label: "زیر عنوان",
          },
          {
            label: 'نامک',
            name: 'slug',
            type: 'string',
            required: true,
          },          
          {
            type: "reference",
            name: "people",
            collections: ["people"],
            label: "نویسنده",
          },          
          {
            type: "datetime",
            name: "date",
            label: "تاریخ",
            required: true,
          },
          {
            type: 'boolean',
            name: 'published',
            label: 'انتشار'
          },          
          {
            type: "reference",
            name: "categories",
            collections: ["categories"],
            label: "دسته",
          },
          {
            type: "reference",
            name: "contents",
            collections: ["contents"],
            label: "نوع محتوا",
          },
          {
            type: "object",
            list: true,
            name: "tags",
            label: "تگ‌ها",
            ui: {
              itemProps: (item) => {
                return { label: `${item?.tag} `}
              }
            },
            fields: [
              {
                type: "reference",
                label: "تگ",
                name: "tag",
                collections: ["tags"],
              },
            ],
          },
          {
            type: 'image',
            label: 'فایل پی‌دی‌اف',
            name: 'pdfFile',
          },          
          {
            type: "string",
            name: "excerpt",
            label: "معرفی (خلاصه)",
            ui: {
              component: 'textarea',
            },
          },
          {
            type: "string",
            name: "body",
            label: "متن",
            isBody: true,
            ui: {
              component: 'textarea',
            },
          },
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {
              const date = new Date();
              const day = ('0' + date.getDate()).slice(-2);
              const month = ('0' + (date.getMonth()+1)).slice(-2);
              const year = date.getFullYear();
        
              let currentDate = `${year}-${month}-${day}`;
        
              return `${currentDate}-${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
      {
        name: "course",
        label: "دوره‌ها",
        path: "_courses",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "عنوان",
            isTitle: true,
            required: true,
          },
          {
            label: 'نامک',
            name: 'slug',
            type: 'string',
            required: true,
          },          
          {
            type: "reference",
            name: "people",
            collections: ["people"],
            label: "مدرس",
            required: true,
          },          
          {
            type: "datetime",
            name: "start",
            label: "تاریخ شروع",
            required: true,
          },
          {
            type: 'boolean',
            name: 'published',
            label: 'انتشار'
          },          
          {
            type: "reference",
            name: "categories",
            collections: ["categories"],
            label: "دسته",
          },
          {
            type: "object",
            list: true,
            name: "tags",
            label: "تگ‌ها",
            ui: {
              itemProps: (item) => {
                return { label: `${item?.tag} `}
              }
            },
            fields: [
              {
                type: "reference",
                label: "تگ",
                name: "tag",
                collections: ["tags"],
              },
            ],
          },
          {
            type: "string",
            name: "excerpt",
            label: "معرفی (خلاصه)",
            ui: {
              component: 'textarea',
            },
          },
          {
            type: "string",
            name: "body",
            label: "متن",
            isBody: true,
            ui: {
              component: 'textarea',
            },
          },
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {
              const date = new Date();
              const day = ('0' + date.getDate()).slice(-2);
              const month = ('0' + (date.getMonth()+1)).slice(-2);
              const year = date.getFullYear();
        
              let currentDate = `${year}-${month}-${day}`;
        
              return `${currentDate}-${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
      {
        label: 'افراد',
        name: 'people',
        path: '_people',
        fields: [
          {
            label: 'نام',
            name: 'title',
            type: 'string',
            isTitle: true,
            required: true,
          },
          {
            label: 'نامک',
            name: 'slug',
            type: 'string',
            required: true,
          },          
          {
            label: 'تصویر',
            name: 'image',
            type: 'image',
          },
          {
            type: "rich-text",
            name: "body",
            label: "توضیح",
            isBody: true,
          },   
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
      {
        label: 'موضوعات',
        name: 'categories',
        path: '_categories',
        fields: [
          {
            label: 'عنوان',
            name: 'title',
            type: 'string',
            isTitle: true,
            required: true,
          },
          {
            label: 'نامک',
            name: 'slug',
            type: 'string',
            required: true,
          },          
          {
            label: 'تصویر',
            name: 'image',
            type: 'image',
          },
          {
            type: "rich-text",
            name: "body",
            label: "توضیح",
            isBody: true,
          },   
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
      {
        label: 'برچسب‌ها',
        name: 'tags',
        path: '_tags',
        fields: [
          {
            label: 'عنوان',
            name: 'title',
            type: 'string',
            isTitle: true,
            required: true,
          },
          {
            label: 'نامک',
            name: 'slug',
            type: 'string',
            required: true,
          },          
          {
            label: 'تصویر',
            name: 'image',
            type: 'image',
          },
          {
            type: "rich-text",
            name: "body",
            label: "توضیح",
            isBody: true,
          },   
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
      {
        label: 'انواع محتوا',
        name: 'contents',
        path: '_contents',
        fields: [
          {
            label: 'عنوان',
            name: 'title',
            type: 'string',
            isTitle: true,
            required: true,
          },
          {
            label: 'نامک',
            name: 'slug',
            type: 'string',
            required: true,
          },          
          {
            label: 'تصویر',
            name: 'icon',
            type: 'string',
          },
          {
            type: "rich-text",
            name: "body",
            label: "توضیح",
            isBody: true,
          },   
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {
              return `${values?.slug?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
      {
        name: "page",
        label: "صفحات",
        path: "_pages",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "عنوان",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "نامک",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
        ui: {
          filename: {
            readonly: true,
            slugify: values => {        
              return `${values?.title?.toLowerCase().replace(/ /g, '-')}`
            }
          }
        },
      },
    ],
  },
});
