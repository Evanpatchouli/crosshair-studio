import { IconButton, ImageList, ImageListItem, ImageListItemBar, Stack, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import AddBoxIcon from "@mui/icons-material/AddBox";

const crosshairs = Array.from({ length: 10 }).map((_, i) => ({
  url:
    i % 2 === 0
      ? `https://www.cscrosshair.com/img/crosshairimg/afro.png`
      : "https://th.bing.com/th/id/R.3b3da8067b9625e7cbf843b572dd1fb2?rik=zQPBtTBiXpHvGg&riu=http%3a%2f%2fpic.616pic.com%2fys_img%2f00%2f14%2f24%2fsjCfk1OXLL.jpg&ehk=Hm0%2b3G0UV1Wz1olfegO3D2KMdx2LLXRc9%2bK5Pm2OgVU%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1",
  title: `准星${i}`,
  desc: i % 2 === 0 ? `这是准星${i}的描述` : "",
}));

export default function CrosshairOnline() {
  return (
    <>
      <h2>浏览在线准星</h2>
      <ImageList sx={{ width: 600, height: 400, borderRadius: 3 }} cols={3} rowHeight={150} gap={20}>
        {crosshairs.map((item) => (
          <ImageListItem
            key={item.url}
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              // border: "1px solid #eaeaea",
              boxShadow: "0 0 1px rgba(0, 0, 0, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.07)",
            }}
          >
            <img
              // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
              src={`${item.url}`}
              alt={item.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            <ImageListItemBar
              title={item.title}
              // subtitle={item.subtitle}
              actionIcon={
                <Stack flexDirection="row" alignItems="center">
                  {item.desc && (
                    <Tooltip title={item.desc}>
                      <InfoIcon
                        sx={{
                          color: "rgba(255, 255, 255, 0.54)",
                          "&:hover": {
                            cursor: "pointer",
                          },
                        }}
                        aria-label={`info about ${item.title}`}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title="应用此准星">
                    <IconButton sx={{ color: "rgba(255, 255, 255, 0.54)" }} aria-label={`apply ${item.title}`}>
                      <AddBoxIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </>
  );
}
